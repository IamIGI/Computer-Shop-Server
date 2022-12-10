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
/** filter articles by given type: none / news / guide */
function filterArticles(articleType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (articleType === 'none') {
            return yield Articles_1.default.find({}).sort({ $natural: -1 }).lean();
        }
        else {
            return yield Articles_1.default.find({ type: articleType }).sort({ $natural: -1 }).lean();
        }
    });
}
/** return last n arguments sorted by date when they where added to mongoDB collection */
function returnNumberOfArticles(number) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Articles_1.default.find({}, {
            followedBy: {
                $slice: number,
            },
        })
            .sort({ $natural: -1 })
            .limit(3)
            .lean();
    });
}
exports.default = { filterArticles, returnNumberOfArticles };
