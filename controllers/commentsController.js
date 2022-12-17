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
exports.likeComment = exports.getProductAverageScore = exports.addComment = exports.getComments = void 0;
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
    try {
        const productComments = yield Comments_1.default.findOne({ productId }).exec();
        if (!productComments)
            return res.status(204).send([]);
        let filteredComments = { comments: productComments.comments, length: productComments.comments.length };
        filteredComments = comment_services_1.default.filterComments(filteredComments, rating, confirmed);
        filteredComments.comments = comment_services_1.default.sortComments(filteredComments.comments, sortBy); //date, -date, content.rating, likes.up
        const commentsObject = {
            comments: filteredComments.comments,
            images: usersImages,
            length: filteredComments.length,
            length_AllComments: productComments.comments.length,
        };
        return res.status(200).json(commentsObject);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.getComments = getComments;
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
        userName = foundUser.firstName;
        userCommentedThisProduct = comment_services_1.default.userCommentOnProduct(foundUser, doc.productId);
        if (userCommentedThisProduct) {
            console.log('userCommentedThisProduct');
            return res
                .status(403)
                .json({ message: 'User commented this product already', code: 102, userId: `${doc.userId}` });
        }
        confirmed = yield comment_services_1.default.confirmedComment(foundUser, doc.productId);
    }
    else {
        console.log('Anonymous user');
        userName = doc.userName;
        userId = '';
    }
    let { added, images } = (0, isImageAttachedMessage_1.default)(files);
    //Save comment to given product comment collection
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
exports.addComment = addComment;
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
exports.getProductAverageScore = getProductAverageScore;
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { productId, commentId, userId, likes } = req.body;
    if (!userId)
        return res.status(403).json({ message: 'Only logged user can give like', userId: `${userId}` });
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
        });
    }
});
exports.likeComment = likeComment;
exports.default = { getComments: exports.getComments, addComment: exports.addComment, getProductAverageScore: exports.getProductAverageScore, likeComment: exports.likeComment };
