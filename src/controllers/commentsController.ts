import UserModel from '../model/Users';
import CommentModel from '../model/Comments';
import { apiErrorHandler } from '../middleware/errorHandlers';
import format from 'date-fns/format';
import commentsFilters from '../middleware/filters/commentsFilters';
import { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import commentServices from '../services/comment.services';
import validateMessage from '../utils/validateMessage';
import imageAttachedToMessage from '../utils/isImageAttachedMessage';

export const getComments = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const {
        productId,
        filters: { rating, confirmed },
        sortBy,
    } = req.body as { productId: string; filters: { rating: number; confirmed: boolean }; sortBy: string };

    // get images
    const usersImages = commentServices.getUsersProductImages(productId);
    console.log('images:');
    console.log(usersImages);
    console.log('-----');
    try {
        const productComments = await CommentModel.findOne({ productId }).exec();
        if (!productComments) return res.status(204).send([]);

        let filteredComments = { comments: productComments.comments, length: productComments.comments.length };

        filteredComments = commentServices.filterComments(filteredComments, rating, confirmed);

        filteredComments.comments = commentServices.sortComments(filteredComments.comments, sortBy); //date, -date, content.rating, likes.up

        console.log({
            comments: filteredComments.comments,
            images: usersImages,
            length: filteredComments.length,
            length_AllComments: productComments.comments.length,
        });

        return res.status(200).json({
            comments: filteredComments.comments,
            images: usersImages,
            length: filteredComments.length,
            length_AllComments: productComments.comments.length,
        });
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

export const addComment = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const files = req.files as fileUpload.FileArray;
    const doc = req.body;
    let userCommentedThisProduct = false;
    let confirmed = false;
    let userName = '';
    let userId = req.body.userId;

    if (await validateMessage(doc.userName)) {
        return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: '105' });
    }

    if (await validateMessage(doc.description)) {
        return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: '101' });
    }

    await commentServices.createDocumentForProductComments(req, res, doc.productId);

    //Check if it is a logged user comment
    if (Boolean(doc.userId)) {
        let foundUser = await UserModel.findOne({ _id: doc.userId }).exec();

        userName = foundUser!.firstName;

        userCommentedThisProduct = commentServices.userCommentOnProduct(foundUser!, doc.productId);

        if (userCommentedThisProduct) {
            console.log('userCommentedThisProduct');
            return res
                .status(403)
                .json({ message: 'User commented this product already', code: 102, userId: `${doc.userId}` });
        }

        confirmed = await commentServices.confirmedComment(foundUser!, doc.productId);
    } else {
        console.log('Anonymous user');
        userName = doc.userName;
        userId = '';
    }

    let { added, images } = imageAttachedToMessage(files);

    //Save comment to given product comment collection
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

    if (added) {
        await commentServices.updateImagesUrlInDB(files, doc.productId, commentId);
    }

    if (!userCommentedThisProduct && doc.userId !== '') {
        await commentServices.assignCommentToUserAccount(doc.userId, commentId, doc.productId);
    }

    commentServices.saveImages(files, doc.productId, commentId);

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
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

export const likeComment = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { productId, commentId, userId, likes } = req.body;

    if (!userId) return res.status(403).json({ message: 'Only logged user can give like', userId: `${userId}` });

    const { likedComment, userLikedAlready } = await commentServices.checkForUserLike(productId, commentId, userId);

    //------commment--------
    if (!userLikedAlready) {
        const { status, message } = await commentServices.saveFirstLikeFromGivenUser(
            likes.up,
            productId,
            userId,
            commentId
        );
        return res.status(status).json({ message, userId: `${userId}` });
    } else {
        const response = await commentServices.changeUserLikeChoice(
            likedComment!.likeUp,
            likes.up,
            productId,
            commentId,
            userId
        );

        return res.status(response.status).json({
            message: response.message,
            like: response.like,
            commentId: response.commentId,
            userId: response.userId,
        });
    }
};

export default { getComments, addComment, getProductAverageScore, likeComment };
