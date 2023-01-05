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
Object.defineProperty(exports, "__esModule", { value: true });
const contactInfo_1 = require("../model/generalData/contactInfo");
const deliveryPrices_1 = require("../model/generalData/deliveryPrices");
/** get delivery prices  */
function getDeliveryPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return (yield deliveryPrices_1.DeliveryPricesModel.findOne({}).exec());
        }
        catch (err) {
            console.log(err);
        }
    });
}
/** get contact info  */
function getContactInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return (yield contactInfo_1.ContactInfoModel.findOne({}).exec());
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = { getDeliveryPrices, getContactInfo };
