"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Orders_1 = __importDefault(require("../model/Orders"));
const ForbiddenWords_1 = __importDefault(require("../model/ForbiddenWords"));
const Comments_1 = __importDefault(require("../model/Comments"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const dataFns = __importStar(require("date-fns"));
const { format } = dataFns;
const commentsFilters = __importStar(require("../middleware/filters/commentsFilters"));
const path = __importStar(require("path"));
const getUsersProductImages_1 = __importDefault(require("../middleware/comments/getUsersProductImages"));
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { productId, filters: { rating, confirmed }, sortBy, } = req.body;
    // get images
    const usersImages = (0, getUsersProductImages_1.default)(productId);
    try {
        const productComments = yield Comments_1.default.findOne({ productId }).exec();
        if (!productComments)
            return res.status(204).send([]);
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
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.getComments = getComments;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`${req.originalUrl}`);
    const files = req.files;
    const doc = req.body;
    let userCommentedThisProduct = false;
    let confirmed = false;
    let userName = '';
    let userId = req.body.userId;
    let createProductDocument = true;
    //Check for vulgar and offensive content
    const forbiddenWords = (yield ForbiddenWords_1.default.find({}).exec())[0].forbiddenWords;
    let userComment = (_a = doc === null || doc === void 0 ? void 0 : doc.description) === null || _a === void 0 ? void 0 : _a.toLowerCase();
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
    const commentDocuments = yield Comments_1.default.find({}).exec();
    for (let i = 0; i < commentDocuments.length; i++) {
        if (commentDocuments[i].productId == doc.productId) {
            createProductDocument = false;
            break;
        }
    }
    if (createProductDocument) {
        try {
            const result = yield Comments_1.default.create({
                productId: doc.productId,
            });
            console.log({ message: 'New document for given product created', productId: `${result.productId}` });
        }
        catch (err) {
            (0, errorHandlers_1.apiErrorHandler)(req, res, err);
        }
    }
    //Check if it is a logged user comment
    if (Boolean(doc.userId)) {
        //Check if someone trying to sneak up with fake userId
        foundUser = yield Users_1.default.findOne({ _id: doc.userId }).exec();
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
            const userOrders_Content = yield Orders_1.default.find({ _id: { $in: userOrders_Id } });
            for (let i = 0; i < userOrders_Content.length; i++) {
                if (userOrders_Content[i].products) {
                    for (let j = 0; j < userOrders_Content[i].products.length; j++) {
                        if (doc.productId == userOrders_Content[i].products[j]._id) {
                            confirmed = true;
                            break;
                        }
                    }
                }
                if (confirmed)
                    break;
            }
        }
        else {
            return res.status(403).json({ message: 'Given userId is incorrect', code: 103, userId: `${doc.userId}` });
        }
    }
    else {
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
    const createComment = yield Comments_1.default.updateOne({ productId: doc.productId }, {
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
    });
    //get the last comment
    const productComments = (yield Comments_1.default.findOne({ productId: doc.productId }).exec()).comments;
    let commentId = productComments[productComments.length - 1]._id;
    commentId = commentId.toString();
    images = [];
    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push(`comments/${doc.productId}/${commentId}/${files[key].name}`);
        });
        //update image with url:
        yield Comments_1.default.findOneAndUpdate({
            productId: doc.productId,
        }, {
            $set: { 'comments.$[comment].image': { added: true, images: images } },
        }, {
            arrayFilters: [
                {
                    'comment._id': commentId,
                },
            ],
        });
    }
    // Save comments to user Data
    if (!userCommentedThisProduct && doc.userId !== '') {
        yield Users_1.default.updateOne({ _id: doc.userId }, {
            $push: { userComments: commentId, commentedProducts: doc.productId },
        });
    }
    if (Boolean(files)) {
        Object.keys(files).forEach((key) => {
            const filepath = path.join(__dirname, `../files/comments/${doc.productId}/${commentId}`, files[key].name);
            files[key].mv(filepath, (err) => {
                if (err)
                    return console.log({ status: 'error', message: err });
                if (err)
                    return res.status(400).json({ status: 'error', message: err });
            });
        });
    }
    if (!createComment) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
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
        const response = yield commentsFilters.getAverageScore(productId);
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
    let firstLikeForComment = false;
    let userLikedAlready = false;
    let increment = {};
    let likeType = '';
    let likedComment = {};
    if (!Boolean(userId))
        return res.status(403).json({ message: 'Only logged user can give like', userId: `${userId}` });
    //Check if user liked already given product
    const givenProductComments = (yield Comments_1.default.findOne({
        productId,
    }).exec()).comments;
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
        }
        else {
            likeType = 'Down';
            increment = { 'comments.$[comment].likes.down': 1 };
        }
        try {
            yield Comments_1.default.findOneAndUpdate({
                productId,
            }, {
                $inc: increment,
                $push: { 'comments.$[comment].usersWhoLiked': { userId, likeUp: likes.up } },
            }, {
                arrayFilters: [
                    {
                        'comment._id': commentId,
                    },
                ],
            });
            console.log({ message: 'Added new user', userId });
            return res.status(201).json({ message: 'Added new like from user', userId: `${userId}` });
        }
        catch (err) {
            console.log(err);
            return res.send(err);
        }
    }
    else {
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
            }
            else {
                likeType = 'Down';
                increment = { 'comments.$[comment].likes.up': -1, 'comments.$[comment].likes.down': 1 };
            }
        }
    }
    try {
        const response = yield Comments_1.default.updateOne({
            productId,
        }, {
            $set: {
                'comments.$[comment].usersWhoLiked.$[user].likeUp': likes.up,
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
        console.log(response);
        return res.status(201).json({ message: `Updated likes`, like: `${likeType}`, commentId: `${commentId}` });
    }
    catch (err) {
        console.log(err);
        return res.send(err);
    }
});
exports.likeComment = likeComment;
