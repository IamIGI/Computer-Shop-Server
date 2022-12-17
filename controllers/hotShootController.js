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
const HotShoot_1 = __importDefault(require("../model/HotShoot"));
const hotShootPromotion_services_1 = __importDefault(require("../services/hotShootPromotion.services"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const node_schedule_1 = __importDefault(require("node-schedule"));
//-------Schedule HotShootPromotion automatic change
//morning Promotion
node_schedule_1.default.scheduleJob('58 59 09 * * *', function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(' hotShootController.ts -> timer start 10:00, promo by 20 %');
        yield hotShootPromotion_services_1.default.changeHotShootPromotion(20);
    });
});
//evening Promotion
node_schedule_1.default.scheduleJob('58 59 21 * * *', function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(' hotShootController.ts -> timer start 22:00, promo by 25%');
        yield hotShootPromotion_services_1.default.changeHotShootPromotion(25);
    });
});
const getHotShoot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    try {
        const hotShoot = (yield HotShoot_1.default.find({}).lean())[0];
        const productForHotShoot = hotShoot.promotion;
        return res.status(200).json(productForHotShoot);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const changeHotShootTimer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    try {
        const response = yield hotShootPromotion_services_1.default.changeHotShootPromotion(20);
        console.log(response);
        return res.status(200).json(response);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const setHotShoot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { discountValue, product } = req.body;
    const response = hotShootPromotion_services_1.default.discountProduct(discountValue, product);
    res.status(200).json({ message: 'Hot Shoot promotion set', discountValue: response, productPrice: product.price });
});
exports.default = { getHotShoot, changeHotShootTimer, setHotShoot };
