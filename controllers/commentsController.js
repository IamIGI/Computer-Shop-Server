const Users = require('../model/Users');
const Orders = require('../model/Orders');
const ForbiddenWords = require('../model/ForbiddenWords');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');
const { createSearchParams } = require('react-router-dom');

const getComments = async (req, res) => {
    console.log(`${req.originalUrl}`);
    console.log(`Params: ${JSON.stringify(req.params.productId)}`);
    const productId = req.params.productId;
    try {
        const comments = await Comments.findOne({ productId }).exec();
        return res.send(comments);
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

const addComment = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    let userCommentedThisProduct = false;
    let confirmed = false;
    let userName = '';
    let userId = req.body.userId;
    let createProductDocument = true;

    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    let userComment = doc.content.description.toLowerCase();
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (userComment.includes(forbiddenWords[i])) {
            return res.status(403).json({ message: 'Given content contains vulgar and offensive content', code: 001 });
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

    //update product Comment collection
    const createComment = await Comments.updateOne(
        { productId: doc.productId },
        {
            $push: {
                comments: {
                    userId,
                    userName,
                    date: format(new Date(), 'yyyy.MM.dd'),
                    confirmed,
                    content: {
                        rating: doc.content.rating,
                        description: doc.content.description,
                    },
                },
            },
        }
    );

    // Save comments to user Data
    if (!userCommentedThisProduct && doc.userId !== '') {
        const productComments = (await Comments.findOne({ productId: doc.productId }).exec()).comments;
        const commentId = productComments[productComments.length - 1]._id;
        await Users.updateOne(
            { _id: doc.userId },
            {
                $push: { userComments: commentId, commentedProducts: doc.productId },
            }
        );
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
    console.log(`Params: ${JSON.stringify(req.params.productId)}`);
    const productId = req.params.productId;

    let averageScore = 0;

    try {
        const productComments = await Comments.findOne({ productId }).exec();

        //get average score
        for (let i = 0; i < productComments.comments.length; i++) {
            averageScore += productComments.comments[i].content.rating;
        }
        averageScore = averageScore / productComments.comments.length;
        averageScore = Math.round(averageScore * 2) / 2;
        console.log({ averageScore });
        return res.status(200).json({ averageScore });
    } catch (err) {
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
    console.log(likes.up);
    try {
        const response = await Comments.updateOne(
            {
                productId,
                'comments._id': commentId,
                'comments.usersWhoLiked.userId': userId,
            },
            {
                $set: { 'comments._id.$[outer].usersWhoLiked._userId.$[inner].likeUp': likes.up },
            },
            {
                arrayFilters: [{ 'outer._id': commentId }, { 'inner._userId': userId }],
            }
        ).exec();
        return res.status(201).json({ response });
    } catch (err) {
        console.log(err);
        return res.send(err);
    }

    // try {
    //     const response = await Comments.findOneAndUpdate(
    //         {
    //             productId,
    //             comments: { $elemMatch: { usersWhoLiked: { $elemMatch: { userId } } } },
    //         },
    //         {
    //             $set: { 'comments.$[outer].usersWhoLiked.$[inner].likeUp': likes.up },
    //         },
    //         {
    //             arrayFilters: [{ 'outer._id': commentId }, { 'inner._userId': userId }],
    //         }
    //     ).exec();
    //     return res.status(201).json({ response });
    // } catch (err) {
    //     console.log(err);
    //     return res.send(err);
    // }

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
    console.log(`firstLikeForComment: ${firstLikeForComment} \t userLikedAlready : ${userLikedAlready}`);
    //------commment--------
    if (firstLikeForComment || !userLikedAlready) {
        //First likes from given user
        if (likes.up) {
            likeType = 'Up';
            increment = { 'comments.$.likes.up': 1 };
        } else {
            likeType = 'Down';
            increment = { 'comments.$.likes.down': 1 };
        }

        try {
            await Comments.findOneAndUpdate(
                {
                    productId,
                    'comments._id': commentId,
                },
                {
                    $push: { 'comments.$.usersWhoLiked': { userId, likeUp: likes.up } },
                }
            );
            console.log({ message: 'Added new user', userId });
        } catch (err) {
            console.log(err);
            return res.send(err);
        }
    } else {
        if (userLikedAlready) {
            //Check if user want to use the same like action again
            if (likedComment.likeUp == likes.up) {
                return res.status(403).json({ message: 'Like action: The user can only change his choice' });
            }
            console.log('userChangeHisChoice');
            if (likes.up) {
                likeType = 'Up';
                increment = { 'comments.$.likes.up': 1, 'comments.$.likes.down': -1 };
            } else {
                likeType = 'Down';
                increment = { 'comments.$.likes.up': -1, 'comments.$.likes.down': 1 };
            }
        }
    }

    try {
        const response = await Comments.findOne(
            {
                productId,
                comments: { $elemMatch: { _id: commentId, 'usersWhoLiked._userId': userId } },
            }
            // {
            //     // $inc: increment,
            //     $set: { 'comments.$[outer].usersWhoLiked.$[inner].likeUp': likes.up },
            // },
            // {
            //     arrayFilters: [{ 'outer._id': commentId }, { 'inner._userId': userId }],
            // }
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
