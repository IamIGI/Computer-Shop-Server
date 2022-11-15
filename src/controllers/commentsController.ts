import Users from '../model/Users';
import Orders from '../model/Orders';
import ForbiddenWords from '../model/ForbiddenWords';
import CommentModel from '../model/Comments';
import { apiErrorHandler } from '../middleware/errorHandlers';
import format from 'date-fns/format';
import commentsFilters from '../middleware/filters/commentsFilters';
import path from 'path';
import getUsersProductImages from '../middleware/comments/getUsersProductImages';
import { Request, Response } from 'express';
import fileUpload from 'express-fileupload';

export const getComments = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const {
        productId,
        filters: { rating, confirmed },
        sortBy,
    } = req.body as { productId: string; filters: { rating: number; confirmed: boolean }; sortBy: string };

    // get images
    const usersImages = getUsersProductImages(productId);

    try {
        const productComments = await CommentModel.findOne({ productId }).exec();
        if (!productComments) return res.status(204).send([]);
        //Init values for comments (before filtering)
        let filteredComments = { comments: productComments.comments, length: productComments.comments.length };

        filteredComments = commentsFilters.filterRating(filteredComments, rating); // 0 = all
        filteredComments = commentsFilters.filterConfirmed(filteredComments, confirmed); //0 - true, 1- false, 2 - mean "No filter"

        filteredComments.comments = commentsFilters.sortComments(filteredComments.comments, sortBy); //date, -date, content.rating, likes.up

        return res.status(200).json({
            comments: filteredComments.comments,
            images: usersImages,
            length: filteredComments.length,
            length_AllComments: productComments.comments.length,
        });
    } catch (err: any) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

export const addComment = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const files = req.files as fileUpload.FileArray; // https://github.com/richardgirges/express-fileupload/issues/156
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
            return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: 105 });
        }
    }
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (userComment.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: 101 });
        }
    }

    //create document for products comment.

    //check if product document already exists in comments collection
    const commentDocuments = await CommentModel.find({}).exec();
    for (let i = 0; i < commentDocuments.length; i++) {
        if (commentDocuments[i].productId == doc.productId) {
            createProductDocument = false;
            break;
        }
    }
    if (createProductDocument) {
        try {
            const result = await CommentModel.create({
                productId: doc.productId,
            });
            console.log({ message: 'New document for given product created', productId: `${result.productId}` });
        } catch (err: any) {
            apiErrorHandler(req, res, err as Error);
        }
    }

    //Check if it is a logged user comment
    if (Boolean(doc.userId)) {
        //Check if someone trying to sneak up with fake userId
        let foundUser = await Users.findOne({ _id: doc.userId }).exec();
        if (foundUser) {
            console.log('Comment by logged user');
            userName = foundUser.firstName;

            //Check if user commented on that product
            for (let i = 0; i < foundUser.commentedProducts.length; i++) {
                if (foundUser.commentedProducts[i] == doc.productId) {
                    userCommentedThisProduct = true;
                    return res
                        .status(403)
                        .json({ message: 'User commented this product already', code: 102, userId: `${doc.userId}` });
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
            return res.status(403).json({ message: 'Given userId is incorrect', code: 103, userId: `${doc.userId}` });
        }
    } else {
        console.log('Anonymous user');
        userName = doc.userName;
        userId = '';
    }

    //Check if file is attached to the message
    let added = false;
    let images: string[] = [];

    // if (Boolean(files)) { changes for ts
    if (files) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push((files[key as keyof typeof files] as fileUpload.UploadedFile).name);
        });
    }

    //update product Comment collection
    const createComment = await CommentModel.updateOne(
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
    const response = await CommentModel.findOne({ productId: doc.productId }).exec();
    const productComments = response!.comments;
    let commentId = productComments[productComments.length - 1]._id;
    commentId = commentId!.toString();
    images = [];
    // if (Boolean(files)) {
    if (files) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push(
                `comments/${doc.productId}/${commentId}/${
                    (files[key as keyof typeof files] as fileUpload.UploadedFile).name
                }`
            );
        });

        //update image with url:
        await CommentModel.findOneAndUpdate(
            {
                productId: doc.productId,
            },
            {
                $set: { 'comments.$[comment].image': { added: true, images: images } },
            },
            {
                arrayFilters: [
                    {
                        'comment._id': commentId,
                    },
                ],
            }
        );
    }

    // Save comments to user Data
    if (!userCommentedThisProduct && doc.userId !== '') {
        await Users.updateOne(
            { _id: doc.userId },
            {
                $push: { userComments: commentId, commentedProducts: doc.productId },
            }
        );
    }

    // if (Boolean(files)) {
    if (files) {
        Object.keys(files).forEach((key) => {
            const filepath = path.join(
                __dirname,
                `../files/comments/${doc.productId}/${commentId}`,
                (files[key as keyof typeof files] as fileUpload.UploadedFile).name
            );

            (files[key as keyof typeof files] as fileUpload.UploadedFile).mv(filepath, (err: object) => {
                if (err) return console.log({ status: 'error', message: err });
                if (err) return res.status(400).json({ status: 'error', message: err });
            });
        });
    }

    if (!createComment) {
        console.log(`Error: could not create a comment`, req, res);
        // apiErrorHandler(req, res, err as Error);
    } else {
        console.log({ message: 'Successfully save a new comment', code: 104 });
        return res.status(201).json({ message: 'Successfully save a new comment', code: 104 });
    }
};

export const getProductAverageScore = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const productId = req.params.productId;

    try {
        const response = await commentsFilters.getAverageScore(productId);
        return res.status(200).json(response);
    } catch (err: any) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

export const likeComment = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { productId, commentId, userId, likes } = req.body;
    let firstLikeForComment = false;
    let userLikedAlready = false;
    let increment = {};
    let likeType = '';
    let likedComment: { userId: string; likeUp: boolean } | undefined;

    if (!Boolean(userId))
        return res.status(403).json({ message: 'Only logged user can give like', userId: `${userId}` });

    //Check if user liked already given product
    const givenProductComments = (await CommentModel.findOne({
        productId,
    }).exec())!.comments; //!->  non-null assertion operator

    for (var i = 0; i < givenProductComments.length; i++) {
        if (givenProductComments[i]._id == commentId) {
            if (givenProductComments[i].usersWhoLiked!.length < 1) {
                firstLikeForComment = true;
                break;
            }
            for (var j = 0; j < givenProductComments[i].usersWhoLiked!.length; j++) {
                if (givenProductComments[i].usersWhoLiked![j].userId == userId) {
                    likedComment = givenProductComments[i].usersWhoLiked![j];
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
            await CommentModel.findOneAndUpdate(
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
        } catch (err: any) {
            console.log(err);
            return res.send(err);
        }
    } else {
        if (userLikedAlready) {
            //Check if user want to use the same like action again
            if (likedComment!.likeUp == likes.up) {
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
        const response = await CommentModel.updateOne(
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
    } catch (err: any) {
        console.log(err);
        return res.send(err);
    }
};

export default { getComments, addComment, getProductAverageScore, likeComment };
