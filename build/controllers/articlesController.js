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
function DBgetArticles(articleType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (articleType === 'none') {
            console.log('here');
            const response = yield Articles_1.default.find({}).lean();
            console.log(response);
            return response;
        }
        else {
            return yield Articles_1.default.find({ type: articleType }).lean();
        }
    });
}
const getAllArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { type } = req.body;
    try {
        const articles = yield DBgetArticles(type);
        console.log('ARTYKLY: ', articles);
        return res.status(200).json(articles);
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.default = { getAllArticles };