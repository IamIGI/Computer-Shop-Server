const Users = require('../model/Users');
const Orders = require('../model/Orders');
const ForbiddenWords = require('../model/ForbiddenWords');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');
const commentsFilters = require('../middleware/filters/commentsFilters');
const path = require('path');

const getComments = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const {
        productId,
        filters: { rating, confirmed },
        sortBy,
    } = req.body;
    try {
        const productComments = await Comments.findOne({ productId }).exec();
        if (!productComments) return res.status(204).send([]);
        //Init values for comments (before filtering)
        let filteredComments = { comments: productComments.comments, length: productComments.comments.length };

        filteredComments = commentsFilters.filterRating(filteredComments, rating); // 0 = all
        filteredComments = commentsFilters.filterConfirmed(filteredComments, confirmed); //0 - true, 1- false, 2 - mean "No filter"

        filteredComments.comments = commentsFilters.sortComments(filteredComments.comments, sortBy); //date, -date, content.rating, likes.up

        return res.status(200).json({
            comments: filteredComments.comments,
            length: filteredComments.length,
            length_AllComments: productComments.comments.length,
        });
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

const addComment = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const files = req.files;
    const doc = req.body;
    let userCommentedThisProduct = false;
    let confirmed = false;
    let userName = '';
    let userId = req.body.userId;
    let createProductDocument = true;
    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    let userComment = doc?.description?.toLowerCase();
    // let userComment = doc.content.description.toLowerCase();
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (doc.userName.toLowerCase().includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: 005 });
        }
    }
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (userComment.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: 001 });
        }
    }

    //create document for products comment.

    //check if product document already exists in comments collection
    const commentDocuments = await Comments.find({}).exec();
    for (let i = 0; i < commentDocuments.length; i++) {
        if (commentDocuments[i].productId == doc.productId) {
            createProductDocument = false;
            break;
        }
    }
    if (createProductDocument) {
        try {
            const result = await Comments.create({
                productId: doc.productId,
            });
            console.log({ message: 'New document for given product created', productId: `${result.productId}` });
        } catch (err) {
            apiErrorHandler(req, res, err);
        }
    }

    //Check if it is a logged user comment
    if (Boolean(doc.userId)) {
        //Check if someone trying to sneak up with fake userId
        foundUser = await Users.findOne({ _id: doc.userId }).exec();
        if (foundUser) {
            console.log('Comment by logged user');
            userName = foundUser.firstName;

            //Check if user commented on that product
            for (let i = 0; i < foundUser.commentedProducts.length; i++) {
                if (foundUser.commentedProducts[i] == doc.productId) {
                    userCommentedThisProduct = true;
                    return res
                        .status(403)
                        .json({ message: 'User commented this product already', code: 002, userId: `${doc.userId}` });
                }
            }

            //Check if it is confirmed comment (user bought this product)
            const userOrders_Id = foundUser.userOrders;
            const userOrders_Content = await Orders.find({ _id: { $in: userOrders_Id } });
            for (let i = 0; i < userOrders_Content.length; i++) {
                if (userOrders_Content[i].products) {
                    for (let j = 0; j < userOrders_Content[i].products.length; j++) {
                        if (doc.productId == userOrders_Content[i].products[j]._id) {
                            confirmed = true;
                            break;
                        }
                    }
                }
                if (confirmed) break;
            }
        } else {
            return res.status(403).json({ message: 'Given userId is incorrect', code: 003, userId: `${doc.userId}` });
        }
    } else {
        console.log('Anonymous user');
        userName = doc.userName;
        userId = '';
    }

    //Check if file is attached to the message
    let added = false;
    let images = [];

    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push(files[key].name);
        });
    }

    //update product Comment collection
    const createComment = await Comments.updateOne(
        { productId: doc.productId },
        {
            $push: {
                comments: {
                    userId,
                    userName,
                    date: format(new Date(), 'yyyy.MM.dd.HH.mm.ss'),
                    confirmed,
                    content: {
                        rating: doc.rating,
                        description: doc.description,
                        // rating: doc.content.rating,
                        // description: doc.content.description,
                    },
                    image: {
                        added,
                        images,
                    },
                },
            },
        }
    );

    //get the last comment
    const productComments = (await Comments.findOne({ productId: doc.productId }).exec()).comments;
    const commentId = productComments[productComments.length - 1]._id;

    // Save comments to user Data
    if (!userCommentedThisProduct && doc.userId !== '') {
        await Users.updateOne(
            { _id: doc.userId },
            {
                $push: { userComments: commentId, commentedProducts: doc.productId },
            }
        );
    }

    //Save image to files:
    if (Boolean(files) && !userCommentedThisProduct && doc.userId !== '') {
        Object.keys(files).forEach((key) => {
            const filepath = path.join(
                __dirname,
                `../files/comments/${doc.productId}/authenticatedUser/${doc.userId}/${commentId}`,
                files[key].name
            );
            files[key].mv(filepath, (err) => {
                if (err) return console.log({ status: 'error', message: err });
                if (err) return res.status(400).json({ status: 'error', message: err });
            });
        });
    } else if (Boolean(files)) {
        Object.keys(files).forEach((key) => {
            const filepath = path.join(
                __dirname,
                `../files/comments/${doc.productId}/unauthenticatedUser/${commentId}`,
                files[key].name
            );
            files[key].mv(filepath, (err) => {
                if (err) return console.log({ status: 'error', message: err });
                if (err) return res.status(400).json({ status: 'error', message: err });
            });
        });
    }

    if (!createComment) {
        apiErrorHandler(req, res, err);
    } else {
        console.log({ message: 'Successfully save a new comment', code: 004 });
        return res.status(201).json({ message: 'Successfully save a new comment', code: 004 });
    }
};

const getProductAverageScore = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const productId = req.params.productId;

    try {
        const response = await commentsFilters.getAverageScore(productId);
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

const likeComment = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { productId, commentId, userId, likes } = req.body;
    let firstLikeForComment = false;
    let userLikedAlready = false;
    let increment = {};
    let likeType = '';
    let likedComment = {};

    if (!Boolean(userId))
        return res.status(403).json({ message: 'Only logged user can give like', userId: `${userId}` });

    //Check if user liked already given product
    const givenProductComments = (
        await Comments.findOne({
            productId,
        }).exec()
    ).comments;

    for (var i = 0; i < givenProductComments.length; i++) {
        if (givenProductComments[i]._id == commentId) {
            if (givenProductComments[i].usersWhoLiked.length === 0) {
                firstLikeForComment = true;
                break;
            }
            for (var j = 0; j < givenProductComments[i].usersWhoLiked.length; j++) {
                if (givenProductComments[i].usersWhoLiked[j].userId == userId) {
                    likedComment = givenProductComments[i].usersWhoLiked[j];
                    userLikedAlready = true;
                    break;
                }
            }
        }
    }
    //------commment--------
    if (firstLikeForComment || !userLikedAlready) {
        //First likes from given user
        if (likes.up) {
            likeType = 'Up';
            increment = { 'comments.$[comment].likes.up': 1 };
        } else {
            likeType = 'Down';
            increment = { 'comments.$[comment].likes.down': 1 };
        }

        try {
            await Comments.findOneAndUpdate(
                {
                    productId,
                },
                {
                    $inc: increment,
                    $push: { 'comments.$[comment].usersWhoLiked': { userId, likeUp: likes.up } },
                },
                {
                    arrayFilters: [
                        {
                            'comment._id': commentId,
                        },
                    ],
                }
            );
            console.log({ message: 'Added new user', userId });
            return res.status(201).json({ message: 'Added new like from user', userId: `${userId}` });
        } catch (err) {
            console.log(err);
            return res.send(err);
        }
    } else {
        if (userLikedAlready) {
            //Check if user want to use the same like action again
            if (likedComment.likeUp == likes.up) {
                console.log({ message: 'Like action: The user can only change his choice', userId: `${userId}` });
                return res
                    .status(405) //405 for frontend statement
                    .json({ message: 'Like action: The user can only change his choice', userId: `${userId}` });
            }
            console.log('userChangeHisChoice');
            if (likes.up) {
                likeType = 'Up';
                increment = { 'comments.$[comment].likes.up': 1, 'comments.$[comment].likes.down': -1 };
            } else {
                likeType = 'Down';
                increment = { 'comments.$[comment].likes.up': -1, 'comments.$[comment].likes.down': 1 };
            }
        }
    }

    try {
        const response = await Comments.updateOne(
            {
                productId,
            },
            {
                $set: {
                    'comments.$[comment].usersWhoLiked.$[user].likeUp': likes.up,
                },
                $inc: increment,
            },
            {
                arrayFilters: [
                    {
                        'comment._id': commentId,
                    },
                    {
                        'user.userId': userId,
                    },
                ],
            }
        ).exec();
        console.log(response);
        return res.status(201).json({ message: `Updated likes`, like: `${likeType}`, commentId: `${commentId}` });
    } catch (err) {
        console.log(err);
        return res.send(err);
    }
};

module.exports = {
    getComments,
    addComment,
    getProductAverageScore,
    likeComment,
};
