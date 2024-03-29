"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commentsFilters_1 = __importDefault(require("../middleware/filters/commentsFilters"));
const Comments_1 = __importDefault(require("../model/Comments"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const Orders_1 = __importDefault(require("../model/Orders"));
const Users_1 = __importDefault(require("../model/Users"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
/** filter comments by rating and if is it confirmed
 * confirmed: //0 - true, 1- false, 2 - mean "No filter"
 */
function filterComments(comments, rating, confirmed) {
    let filteredComments = commentsFilters_1.default.filterRating(comments, rating);
    filteredComments = commentsFilters_1.default.filterConfirmed(filteredComments, confirmed);
    return filteredComments;
}
/** sort comments by:date, -date, content.rating, likes.up  */
function sortComments(comments, sortBy) {
    const sortedComments = commentsFilters_1.default.sortComments(comments, sortBy);
    return sortedComments;
}
/** create comment document for product if not exists */
function createDocumentForProductComments(req, res, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        let createProductDocument = true;
        const commentDocuments = yield Comments_1.default.find({}).exec();
        for (let i = 0; i < commentDocuments.length; i++) {
            if (commentDocuments[i].productId == productId) {
                createProductDocument = false;
                break;
            }
        }
        if (createProductDocument) {
            try {
                const result = yield Comments_1.default.create({
                    productId,
                });
                console.log({ message: 'New document for given product created', productId: `${result.productId}` });
            }
            catch (err) {
                (0, errorHandlers_1.apiErrorHandler)(req, res, err);
            }
        }
    });
}
/**return true when user commented already on this product */
function userCommentOnProduct(user, productId) {
    for (let i = 0; i < user.commentedProducts.length; i++) {
        if (user.commentedProducts[i] == productId) {
            return true;
        }
    }
    return false;
}
/**Return true when user bought this product before comment it */
function confirmedComment(user, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userOrders_Id = user.userOrders;
        const userOrders_Content = yield Orders_1.default.find({ _id: { $in: userOrders_Id } });
        for (let i = 0; i < userOrders_Content.length; i++) {
            if (userOrders_Content[i].products) {
                for (let j = 0; j < userOrders_Content[i].products.length; j++) {
                    if (productId == userOrders_Content[i].products[j]._id) {
                        return { confirmed: true, orderId: userOrders_Content[i]._id };
                    }
                }
            }
        }
        return { confirmed: false };
    });
}
/** save images ulr in db  */
function updateImagesUrlInDB(files, productId, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        let imagesURL = [];
        Object.keys(files).forEach((key) => {
            imagesURL.push(`comments/${productId}/${commentId}/${files[key].name}`);
        });
        yield Comments_1.default.findOneAndUpdate({
            productId,
        }, {
            $set: { 'comments.$[comment].image': { added: true, images: imagesURL } },
        }, {
            arrayFilters: [
                {
                    'comment._id': commentId,
                },
            ],
        });
    });
}
/** add comment to user document in Mongo DB */
function assignCommentToUserAccount(userId, commentId, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Users_1.default.updateOne({ _id: userId }, {
            $push: { userComments: commentId, commentedProducts: productId },
        });
    });
}
/** save images for server files */
function saveImages(files, productId, commentId) {
    if (files) {
        Object.keys(files).forEach((key) => {
            const filepath = path_1.default.join(__dirname, `../files/comments/${productId}/${commentId}`, files[key].name);
            files[key].mv(filepath);
        });
    }
}
/** check if user liked already given comment */
function checkForUserLike(productId, commentId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const givenProductComments = (yield Comments_1.default.findOne({
            productId,
        }).exec()).comments;
        let likedComment;
        let userLikedAlready = false;
        for (var i = 0; i < givenProductComments.length; i++) {
            if (givenProductComments[i]._id == commentId) {
                for (var j = 0; j < givenProductComments[i].usersWhoLiked.length; j++) {
                    if (givenProductComments[i].usersWhoLiked[j].userId == userId) {
                        likedComment = givenProductComments[i].usersWhoLiked[j];
                        userLikedAlready = true;
                        return { likedComment, userLikedAlready };
                    }
                }
            }
        }
        return { likedComment, userLikedAlready };
    });
}
/** if it is user first like, save it */
function saveFirstLikeFromGivenUser(thumbUp, productId, userId, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        let likeType = 'Down';
        let increment = { 'comments.$[comment].likes.down': 1 };
        if (thumbUp) {
            likeType = 'Up';
            increment = { 'comments.$[comment].likes.up': 1 };
        }
        try {
            yield Comments_1.default.findOneAndUpdate({
                productId,
            }, {
                $inc: increment,
                $push: { 'comments.$[comment].usersWhoLiked': { userId, likeUp: thumbUp } },
            }, {
                arrayFilters: [
                    {
                        'comment._id': commentId,
                    },
                ],
            });
            console.log('First like from user' + userId);
            return { status: 201, message: 'Added new like from user' };
            // return res.status(201).json({ message: 'Added new like from user', userId: `${userId}` });
        }
        catch (err) {
            throw err;
        }
    });
}
/** change user like option if not the same */
function changeUserLikeChoice(currentLike, newLike, productId, commentId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
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
        let increment = {
            'comments.$[comment].likes.up': -1,
            'comments.$[comment].likes.down': 1,
        };
        if (newLike) {
            likeType = 'Up';
            increment = { 'comments.$[comment].likes.up': 1, 'comments.$[comment].likes.down': -1 };
        }
        try {
            const response = yield Comments_1.default.updateOne({
                productId,
            }, {
                $set: {
                    'comments.$[comment].usersWhoLiked.$[user].likeUp': newLike,
                },
                $inc: increment,
            }, {
                arrayFilters: [
                    {
                        'comment._id': commentId,
                    },
                    {
                        'user.userId': userId,
                    },
                ],
            }).exec();
            return { status: 201, message: `Updated likes`, like: likeType, commentId, statusCode: '003' };
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
/** get user  images from server files for given product */
const getUsersProductImages = (productId) => {
    let urlArray = [];
    let fileName = [];
    let imagePath = '';
    const targetPath = path_1.default.join(__dirname, `../files/comments/${productId}/`);
    if (!fs_1.default.existsSync(targetPath))
        return urlArray;
    const dirInProduct = fs_1.default.readdirSync(targetPath);
    for (let i = 0; i < dirInProduct.length; i++) {
        fileName = fs_1.default.readdirSync(`${targetPath}/${dirInProduct[i]}`);
        imagePath = `comments/${productId}/${dirInProduct[i]}/${fileName[0]}`;
        urlArray.push(imagePath);
    }
    return urlArray;
};
/** return user new comments notification data (productData and orderData)*/
const userProductsToComment = (newComments, productsIds) => {
    let productsData = [];
    newComments.map((orderData) => {
        orderData.products.map((product) => {
            productsIds.map((productId) => {
                if (productId === String(product._id))
                    productsData.push({ product, orderDate: orderData.transactionInfo.date.split(':')[0] });
            });
        });
    });
    return productsData;
};
/** get user comments and number of his comments */
const userComments = (userId, pageNr) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return { status: 406, message: 'No user found' };
    const a = pageNr * 5 - 4 - 1;
    const b = pageNr * 5 - 1;
    let userComments = [];
    const countComments = user.userComments.length;
    for (let i = a; i <= b; i++) {
        let commentId = user.userComments[i];
        if (commentId)
            userComments.push(new mongoose_1.default.Types.ObjectId(commentId));
    }
    try {
        const response = yield Comments_1.default.aggregate([
            {
                $match: {
                    'comments._id': {
                        $in: userComments,
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
                                $in: ['$$comment._id', userComments],
                            },
                        },
                    },
                },
            },
        ]);
        let productsToComment = undefined;
        if (user.notifications.newComment.productIds && user.notifications.newComment.orderIds) {
            let userOrders = [];
            (_a = user.notifications.newComment.orderIds) === null || _a === void 0 ? void 0 : _a.map((orderId) => {
                userOrders.push(new mongoose_1.default.Types.ObjectId(orderId));
            });
            const newComments = yield Orders_1.default.aggregate([
                {
                    $match: {
                        _id: {
                            $in: userOrders,
                        },
                    },
                },
                {
                    $project: {
                        products: 1,
                        transactionInfo: {
                            date: 1,
                        },
                    },
                },
            ]);
            productsToComment = userProductsToComment(newComments, user.notifications.newComment.productIds);
        }
        return {
            status: 200,
            message: 'User comments',
            commentsData: response,
            commentsCount: countComments,
            newComments: productsToComment,
        };
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
const userCommentsSumUpLikes = (data) => {
    let userNumberOfLikes = 0;
    for (let i = 0; i < data.length; i++) {
        userNumberOfLikes += data[i].comment[0].likes.up;
    }
    return userNumberOfLikes;
};
/** remove notification about new comment possibility when user already commented given product */
const removeNotification_ADD_COMMENT = (userData, productId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const commentNotifications = userData.notifications.newComment.productIds;
    if (!commentNotifications) {
        console.log('User do not have any comments notifications alerts left ');
        return;
    }
    const lastNotification = commentNotifications.length === 1;
    const elementFound = commentNotifications.find((item) => item === productId);
    if (!elementFound) {
        console.log('User does not have given product in comments notifications alerts ');
        return;
    }
    try {
        yield Users_1.default.updateOne({ _id: userData._id }, {
            $set: { 'notifications.newComment.showNotification': !lastNotification },
            $pull: {
                'notifications.newComment.productIds': productId,
            },
        });
        const orderData = (yield Orders_1.default.findOne({ _id: orderId }));
        if (orderData.products.length === 1) {
            yield Users_1.default.updateOne({ _id: userData._id }, {
                $pull: {
                    'notifications.newComment.orderIds': orderId,
                },
            });
        }
        console.log('Successfully removed product from user notifications');
    }
    catch (err) {
        throw err;
    }
});
/** check if it is user comment */
const deleteUserComment = (userData, commentId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const commentFound = userData.userComments.find((comment) => comment === commentId);
    if (!commentFound) {
        return { status: 204, message: 'It is not user comment, abort delete' };
    }
    try {
        yield Comments_1.default.updateOne({ productId }, {
            $pull: {
                comments: { _id: commentId },
            },
        });
        yield Users_1.default.updateOne({ _id: userData._id }, {
            $pull: { userComments: commentId, commentedProducts: productId },
        });
        return { status: 202, message: 'Successfully delete user comment' };
    }
    catch (err) {
        throw err;
    }
});
exports.default = {
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
    userCommentsSumUpLikes,
    removeNotification_ADD_COMMENT,
    deleteUserComment,
};
