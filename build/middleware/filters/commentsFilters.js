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
//---------------------------
//For an input size of 1 million numbers, Array. map() takes about 2,000ms, whereas a for loop takes about 250ms
const Comments_1 = __importDefault(require("../../model/Comments"));
const eachScoreInit = [
    { number: 0, percentage: 0 },
    { number: 0, percentage: 0 },
    { number: 0, percentage: 0 },
    { number: 0, percentage: 0 },
    { number: 0, percentage: 0 },
    { number: 0, percentage: 0 },
];
function filterRating(filteredComments, rating) {
    if (rating === 0)
        return filteredComments;
    const filtered = [];
    for (let i = 0; i < filteredComments.length; i++) {
        let comment = filteredComments.comments[i];
        if (comment.content.rating === rating)
            filtered.push(comment);
    }
    return { comments: filtered, length: filtered.length };
}
function filterConfirmed(filteredComments, confirmed) {
    //0 - true, 1- false, 2 - mean "No filter"
    if (!confirmed)
        return filteredComments;
    const filtered = [];
    for (let i = 0; i < filteredComments.length; i++) {
        const comment = filteredComments.comments[i];
        if (comment.confirmed === confirmed)
            filtered.push(comment);
    }
    return { comments: filtered, length: filtered.length };
}
function sortComments(arr, prop) {
    if (prop === 'none')
        return arr;
    let reverse = false;
    if (prop[0] === '-') {
        reverse = true;
        prop = prop.substr(1);
    }
    let ArrProp = prop.split('.');
    var len = ArrProp.length;
    arr.sort(function (a, b) {
        let i = 0;
        while (i < len) {
            a = a[ArrProp[i]];
            b = b[ArrProp[i]];
            i++;
        }
        if (a < b) {
            return 1;
        }
        else if (a > b) {
            return -1;
        }
        else {
            return 0;
        }
    });
    if (reverse)
        return arr.reverse();
    return arr;
}
function getAverageScore(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        let averageScore = 0;
        let averageScore_Stars = 0;
        let averageScore_View = 0;
        let eachScore = [
            { number: 0, percentage: 0 },
            { number: 0, percentage: 0 },
            { number: 0, percentage: 0 },
            { number: 0, percentage: 0 },
            { number: 0, percentage: 0 },
            { number: 0, percentage: 0 },
        ];
        const productComments = yield Comments_1.default.findOne({ productId }).exec();
        // if (!productComments) return res.status(204).send({});
        if (!productComments)
            return { numberOfComments: 0, averageScore_View: 0, averageScore_Stars: 0, eachScore: eachScoreInit };
        const numberOfComments = productComments.comments.length;
        //get average score
        for (let i = 0; i < numberOfComments; i++) {
            let score = productComments.comments[i].content.rating;
            switch (score) {
                case 1:
                    eachScore[0].number += 1;
                    break;
                case 2:
                    eachScore[1].number += 1;
                    break;
                case 3:
                    eachScore[2].number += 1;
                    break;
                case 4:
                    eachScore[3].number += 1;
                    break;
                case 5:
                    eachScore[4].number += 1;
                    break;
                case 6:
                    eachScore[5].number += 1;
                    break;
                default:
                    console.log('Bad score value given');
                    return { message: 'Bad score value given' };
            }
            averageScore += productComments.comments[i].content.rating;
        }
        averageScore = averageScore / numberOfComments;
        averageScore_Stars = Math.round(averageScore);
        averageScore_View = Math.round(averageScore * 10) / 10;
        function getPercentage(score, number) {
            return (score / number) * 100;
        }
        for (var i = 0; i < eachScore.length; i++) {
            eachScore[i].percentage = parseInt(getPercentage(eachScore[i].number, numberOfComments).toFixed(2));
        }
        const data = { numberOfComments, averageScore_View, averageScore_Stars, eachScore };
        return data;
    });
}
exports.default = { filterRating, filterConfirmed, sortComments, getAverageScore };
