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
const Users_1 = __importDefault(require("../model/Users"));
const Comments_1 = __importDefault(require("../model/Comments"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const format_1 = __importDefault(require("date-fns/format"));
const commentsFilters_1 = __importDefault(require("../middleware/filters/commentsFilters"));
const comment_services_1 = __importDefault(require("../services/comment.services"));
const validateMessage_1 = __importDefault(require("../utils/validateMessage"));
const isImageAttachedMessage_1 = __importDefault(require("../utils/isImageAttachedMessage"));
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { productId, filters: { rating, confirmed }, sortBy, } = req.body;
    // get images
    const usersImages = comment_services_1.default.getUsersProductImages(productId);
    console.log('images:');
    console.log(usersImages);
    console.log('-----');
    try {
        const productComments = yield Comments_1.default.findOne({ productId }).exec();
        if (!productComments)
            return res.status(204).send([]);
        let filteredComments = { comments: productComments.comments, length: productComments.comments.length };
        filteredComments = comment_services_1.default.filterComments(filteredComments, rating, confirmed);
        filteredComments.comments = comment_services_1.default.sortComments(filteredComments.comments, sortBy); //date, -date, content.rating, likes.up
        return res.status(200).json({
            comments: filteredComments.comments,
            images: usersImages,
            length: filteredComments.length,
            length_AllComments: productComments.comments.length,
        });
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const files = req.files;
    const doc = req.body;
    let userCommentedThisProduct = false;
    let confirmed = false;
    let userName = '';
    let userId = req.body.userId;
    if (yield (0, validateMessage_1.default)(doc.userName)) {
        return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: '105' });
    }
    if (yield (0, validateMessage_1.default)(doc.description)) {
        return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: '101' });
    }
    yield comment_services_1.default.createDocumentForProductComments(req, res, doc.productId);
    //Check if it is a logged user comment
    if (Boolean(doc.userId)) {
        let foundUser = yield Users_1.default.findOne({ _id: doc.userId }).exec();
        if (!foundUser)
            return { status: 406, message: 'No user found' };
        userName = foundUser.firstName;
        userCommentedThisProduct = comment_services_1.default.userCommentOnProduct(foundUser, doc.productId);
        if (userCommentedThisProduct) {
            console.log('userCommentedThisProduct');
            return res
                .status(403)
                .json({ message: 'User commented this product already', code: 102, userId: `${doc.userId}` });
        }
        confirmed = yield comment_services_1.default.confirmedComment(foundUser, doc.productId);
        // check notifications 'addComment' if productId was commented then remove it from notification
        // - check for productIds notifcation 'addComment'
        // - compare it to commented product
        // - if commented product is in notification productIds arrays then remove it from array
        yield comment_services_1.default.removeNotification_ADD_COMMENT(foundUser, doc.productId);
    }
    else {
        console.log('Anonymous user');
        userName = doc.userName;
        userId = '';
    }
    let { added, images } = (0, isImageAttachedMessage_1.default)(files);
    //Save comment to given product comment collection - move to service
    const createComment = yield Comments_1.default.updateOne({ productId: doc.productId }, {
        $push: {
            comments: {
                userId,
                userName,
                date: (0, format_1.default)(new Date(), 'yyyy.MM.dd.HH.mm.ss'),
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
    });
    //get the last comment
    const response = yield Comments_1.default.findOne({ productId: doc.productId }).exec();
    const productComments = response.comments;
    let commentId = productComments[productComments.length - 1]._id;
    commentId = commentId.toString();
    if (added) {
        yield comment_services_1.default.updateImagesUrlInDB(files, doc.productId, commentId);
    }
    if (!userCommentedThisProduct && doc.userId !== '') {
        yield comment_services_1.default.assignCommentToUserAccount(doc.userId, commentId, doc.productId);
    }
    comment_services_1.default.saveImages(files, doc.productId, commentId);
    if (!createComment) {
        console.log(`Error: could not create a comment`, req, res);
        // apiErrorHandler(req, res, err as Error);
    }
    else {
        console.log({ message: 'Successfully save a new comment', code: 104 });
        return res.status(201).json({ message: 'Successfully save a new comment', code: 104 });
    }
});
const getProductAverageScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const productId = req.params.productId;
    try {
        const response = yield commentsFilters_1.default.getAverageScore(productId);
        return res.status(200).json(response);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { productId, commentId, userId, likes } = req.body;
    if (!userId)
        return res
            .status(200)
            .json({ message: 'Only logged user can give like', userId: `${userId}`, statusCode: '001' });
    const { likedComment, userLikedAlready } = yield comment_services_1.default.checkForUserLike(productId, commentId, userId);
    //------commment--------
    if (!userLikedAlready) {
        const { status, message } = yield comment_services_1.default.saveFirstLikeFromGivenUser(likes.up, productId, userId, commentId);
        return res.status(status).json({ message, userId: `${userId}` });
    }
    else {
        const response = yield comment_services_1.default.changeUserLikeChoice(likedComment.likeUp, likes.up, productId, commentId, userId);
        return res.status(response.status).json({
            message: response.message,
            like: response.like,
            commentId: response.commentId,
            userId: response.userId,
            statusCode: response.statusCode,
        });
    }
});
const getUserComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { userId, pageNr } = req.body;
    console.log(userId, pageNr);
    try {
        const response = yield comment_services_1.default.userComments(userId, pageNr);
        if (response.commentsData !== undefined) {
            comment_services_1.default.userCommentsSumUpLikes(response.commentsData);
        }
        const object = {
            message: response.message,
            commentsData: response.commentsData,
            sumOfLikes: response.commentsData !== undefined ? comment_services_1.default.userCommentsSumUpLikes(response.commentsData) : 0,
            commentsCount: response.commentsCount,
        };
        return res.status(response.status).json(object);
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.default = { getComments, addComment, getProductAverageScore, likeComment, getUserComments };
