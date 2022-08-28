const Users = require('../model/Users');
const Orders = require('../model/Orders');
const ForbiddenWords = require('../model/ForbiddenWords');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const getComments = async (req, res) => {
    console.log(`${req.originalUrl}`);
    console.log(`Params: ${JSON.stringify(req.params.productId)}`);
    const productId = req.params.productId;
    try {
        const productComments = await Comments.findOne({ productId }).exec();
        if (!productComments) return res.status(204).send([]);
        return res.send(productComments.comments);
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
    let averageScore_Stars = 0;
    let averageScore_View = 0;
    let eachScore = [
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
        { number: 0, percentage: 0 },
    ];

    try {
        const productComments = await Comments.findOne({ productId }).exec();
        if (!productComments) return res.status(204).send({});
        const numberOfComments = productComments.comments.length;
        //get average score
        for (let i = 0; i < numberOfComments; i++) {
            let score = productComments.comments[i].content.rating;

            switch (score) {
                case 1:
                    eachScore[0].number += 1;
                    break;
                case 2:
                    eachScore[1].number += 1;
                    break;
                case 3:
                    eachScore[2].number += 1;
                    break;
                case 4:
                    eachScore[3].number += 1;
                    break;
                case 5:
                    eachScore[4].number += 1;
                    break;
                case 6:
                    eachScore[5].number += 1;
                    break;

                default:
                    console.log('Bad score value given');
                    return res.send('Bad score value given');
            }

            averageScore += productComments.comments[i].content.rating;
        }

        averageScore = averageScore / numberOfComments;
        averageScore_Stars = Math.round(averageScore);
        averageScore_View = Math.round(averageScore * 10) / 10;

        function getPercentage(score, number) {
            return (score / number) * 100;
        }
        for (var i = 0; i < eachScore.length; i++) {
            eachScore[i].percentage = getPercentage(eachScore[i].number, numberOfComments);
        }

        console.log(eachScore[1].number);

        return res.status(200).json({ numberOfComments, averageScore_View, averageScore_Stars, eachScore });
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
                    .status(403)
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
        console.log(`Increment: \n`);
        console.log(increment);
        console.log(`--------------`);
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
