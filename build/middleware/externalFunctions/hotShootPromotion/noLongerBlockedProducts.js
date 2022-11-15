"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDateDiffInHours_1 = __importDefault(require("../getDateDiffInHours"));
const format_1 = __importDefault(require("date-fns/format"));
function noLongerBlockedProducts(blockedList, hoursBlocked) {
    const currentDate = (0, format_1.default)(new Date(), 'yyyy.MM.dd-H:m');
    const removeItem = blockedList.filter((blockedProduct) => {
        if ((0, getDateDiffInHours_1.default)(new Date(blockedProduct.date), new Date(currentDate)) >= hoursBlocked) {
            return blockedProduct;
        }
    });
    return removeItem;
}
exports.default = noLongerBlockedProducts;
