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
const Articles_1 = __importDefault(require("../model/Articles"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const article_services_1 = __importDefault(require("../services/article.services"));
const getAllArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const type = req.params.type;
    try {
        const articles = yield article_services_1.default.filterArticles(type);
        return res.status(200).json(articles);
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const getArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const _id = req.params.id;
    try {
        const article = yield Articles_1.default.findOne({ _id }).exec();
        return res.status(200).json(article);
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.default = { getAllArticles, getArticle };
