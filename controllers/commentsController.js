const Users = require('../model/Users');
const Orders = require('../model/Orders');
const ForbiddenWords = require('../model/ForbiddenWords');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

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

const likeComment = async (req, res) => {
    console.log(`${req.originalUrl}`);
    console.log(`Body: ${req.body.commentId}`);
    return res.status(200).json({ message: 'Like section' });
};

module.exports = {
    addComment,
    likeComment,
};
