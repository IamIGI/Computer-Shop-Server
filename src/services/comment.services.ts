import { CommentDocument, CommentSchema } from '../model/Comments';
import commentsFilters from '../middleware/filters/commentsFilters';
import CommentModel from '../model/Comments';
import { apiErrorHandler } from '../middleware/errorHandlers';
import { Request, Response } from 'express';
import { UserDocument } from '../model/Users';
import OrderModel from '../model/Orders';
import UserModel from '../model/Users';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

/** filter comments by rating and if is it confirmed
 * confirmed: //0 - true, 1- false, 2 - mean "No filter"
 */
function filterComments(
    comments: { comments: CommentSchema[]; length: number },
    rating: number,
    confirmed: boolean
): { comments: CommentSchema[]; length: number } {
    let filteredComments = commentsFilters.filterRating(comments, rating);
    filteredComments = commentsFilters.filterConfirmed(filteredComments, confirmed);
    return filteredComments;
}

/** sort comments by:date, -date, content.rating, likes.up  */
function sortComments(comments: CommentSchema[], sortBy: string): CommentSchema[] {
    const sortedComments = commentsFilters.sortComments(comments, sortBy);

    return sortedComments;
}

/** create comment document for product if not exists */
async function createDocumentForProductComments(req: Request, res: Response, productId: string): Promise<void> {
    let createProductDocument = true;
    const commentDocuments = await CommentModel.find({}).exec();
    for (let i = 0; i < commentDocuments.length; i++) {
        if (commentDocuments[i].productId == productId) {
            createProductDocument = false;
            break;
        }
    }
    if (createProductDocument) {
        try {
            const result = await CommentModel.create({
                productId,
            });
            console.log({ message: 'New document for given product created', productId: `${result.productId}` });
        } catch (err) {
            apiErrorHandler(req, res, err as Error);
        }
    }
}
/**return true when user commented already on this product */
function userCommentOnProduct(user: UserDocument, productId: string): boolean {
    for (let i = 0; i < user.commentedProducts.length; i++) {
        if (user.commentedProducts[i] == productId) {
            return true;
        }
    }
    return false;
}

/**Return true when user bought this product before comment it */
async function confirmedComment(user: UserDocument, productId: string): Promise<boolean> {
    const userOrders_Id = user.userOrders;
    const userOrders_Content = await OrderModel.find({ _id: { $in: userOrders_Id } });
    for (let i = 0; i < userOrders_Content.length; i++) {
        if (userOrders_Content[i].products) {
            for (let j = 0; j < userOrders_Content[i].products.length; j++) {
                if (productId == userOrders_Content[i].products[j]._id) {
                    return true;
                }
            }
        }
    }
    return false;
}

/** save images ulr in db  */
async function updateImagesUrlInDB(files: fileUpload.FileArray, productId: string, commentId: string): Promise<void> {
    let imagesURL: string[] = [];
    Object.keys(files).forEach((key) => {
        imagesURL.push(
            `comments/${productId}/${commentId}/${(files[key as keyof typeof files] as fileUpload.UploadedFile).name}`
        );
    });

    await CommentModel.findOneAndUpdate(
        {
            productId,
        },
        {
            $set: { 'comments.$[comment].image': { added: true, images: imagesURL } },
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

/** add comment to user document in Mongo DB */
async function assignCommentToUserAccount(userId: string, commentId: string, productId: string): Promise<void> {
    await UserModel.updateOne(
        { _id: userId },
        {
            $push: { userComments: commentId, commentedProducts: productId },
        }
    );
}

/** save images for server files */
function saveImages(files: fileUpload.FileArray, productId: string, commentId: string): void {
    if (files) {
        Object.keys(files).forEach((key) => {
            const filepath = path.join(
                __dirname,
                `../files/comments/${productId}/${commentId}`,
                (files[key as keyof typeof files] as fileUpload.UploadedFile).name
            );

            (files[key as keyof typeof files] as fileUpload.UploadedFile).mv(filepath);
        });
    }
}

/** check if user liked already given comment */
async function checkForUserLike(
    productId: string,
    commentId: string,
    userId: string
): Promise<{ likedComment: { userId: string; likeUp: boolean } | undefined; userLikedAlready: boolean }> {
    const givenProductComments = (await CommentModel.findOne({
        productId,
    }).exec())!.comments;

    let likedComment: { userId: string; likeUp: boolean } | undefined;
    let userLikedAlready = false;

    for (var i = 0; i < givenProductComments.length; i++) {
        if (givenProductComments[i]._id == commentId) {
            for (var j = 0; j < givenProductComments[i].usersWhoLiked!.length; j++) {
                if (givenProductComments[i].usersWhoLiked![j].userId == userId) {
                    likedComment = givenProductComments[i].usersWhoLiked![j];
                    userLikedAlready = true;

                    return { likedComment, userLikedAlready };
                }
            }
        }
    }
    return { likedComment, userLikedAlready };
}

/** if it is user first like, save it */
async function saveFirstLikeFromGivenUser(
    thumbUp: boolean,
    productId: string,
    userId: string,
    commentId: string
): Promise<{ status: number; message: string }> {
    let likeType = 'Down';
    let increment: { [key: string]: number } = { 'comments.$[comment].likes.down': 1 };

    if (thumbUp) {
        likeType = 'Up';
        increment = { 'comments.$[comment].likes.up': 1 };
    }

    try {
        await CommentModel.findOneAndUpdate(
            {
                productId,
            },
            {
                $inc: increment,
                $push: { 'comments.$[comment].usersWhoLiked': { userId, likeUp: thumbUp } },
            },
            {
                arrayFilters: [
                    {
                        'comment._id': commentId,
                    },
                ],
            }
        );
        console.log('First like from user' + userId);
        return { status: 201, message: 'Added new like from user' };
        // return res.status(201).json({ message: 'Added new like from user', userId: `${userId}` });
    } catch (err) {
        throw err;
    }
}

/** change user like option if not the same */
async function changeUserLikeChoice(
    currentLike: boolean,
    newLike: boolean,
    productId: string,
    commentId: string,
    userId: string
): Promise<{
    status: number;
    message: string;
    like?: string;
    userId?: string;
    commentId?: string;
    statusCode: string;
}> {
    if (currentLike === newLike) {
        console.log({
            message: 'Like action: The user can only change his choice',
            userId: `${userId}`,
            statusCode: '002',
        });

        return {
            status: 200,
            message: 'Like action: The user can only change his choice',
            userId: userId,
            statusCode: '002',
        };
    }
    console.log('userChangeHisChoice');

    let likeType = 'Down';
    let increment: { [key: string]: number } = {
        'comments.$[comment].likes.up': -1,
        'comments.$[comment].likes.down': 1,
    };

    if (newLike) {
        likeType = 'Up';
        increment = { 'comments.$[comment].likes.up': 1, 'comments.$[comment].likes.down': -1 };
    }

    try {
        const response = await CommentModel.updateOne(
            {
                productId,
            },
            {
                $set: {
                    'comments.$[comment].usersWhoLiked.$[user].likeUp': newLike,
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
        return { status: 201, message: `Updated likes`, like: likeType, commentId, statusCode: '003' };
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/** get user  images from server files for given product */
const getUsersProductImages = (productId: string): string[] => {
    let urlArray: string[] = [];
    let fileName: string[] = [];
    let imagePath: string = '';
    const targetPath = path.join(__dirname, `../files/comments/${productId}/`);
    if (!fs.existsSync(targetPath)) return urlArray;

    const dirInProduct = fs.readdirSync(targetPath);
    for (let i = 0; i < dirInProduct.length; i++) {
        fileName = fs.readdirSync(`${targetPath}/${dirInProduct[i]}`);
        imagePath = `comments/${productId}/${dirInProduct[i]}/${fileName[0]}`;
        urlArray.push(imagePath);
    }

    return urlArray;
};
//: Promise<CommentSchema[] | {errMsg: string}>
const userComments = async (
    userId: string,
    pageNr: number
): Promise<{ status: number; message: string; commentsData?: CommentDocument[]; commentsCount?: number }> => {
    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) return { status: 406, message: 'No user found' };

    const a = pageNr * 5 - 4 - 1;
    const b = pageNr * 5 - 1;
    let userComments = [];
    for (let i = a; i <= b; i++) {
        let commentId = user.userComments[i];
        userComments.push(commentId);
    }
    try {
        const response = await CommentModel.aggregate([
            {
                $match: {
                    'comments._id': {
                        $in: [userComments[0], userComments[1], userComments[2], userComments[3], userComments[4]],
                    },
                },
            },
            {
                $project: {
                    productId: 1,
                    comment: {
                        $filter: {
                            input: '$comments',
                            as: 'comment',
                            cond: {
                                $in: [
                                    '$$comment._id',
                                    [
                                        userComments[0],
                                        userComments[1],
                                        userComments[2],
                                        userComments[3],
                                        userComments[4],
                                    ],
                                ],
                            },
                        },
                    },
                },
            },
        ]);

        const countComments = user.userComments.length;
        return { status: 200, message: 'User comments', commentsData: response, commentsCount: countComments };
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export default {
    filterComments,
    sortComments,
    createDocumentForProductComments,
    userCommentOnProduct,
    confirmedComment,
    updateImagesUrlInDB,
    assignCommentToUserAccount,
    saveImages,
    checkForUserLike,
    saveFirstLikeFromGivenUser,
    changeUserLikeChoice,
    getUsersProductImages,
    userComments,
};
