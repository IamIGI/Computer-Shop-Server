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
exports.setHotShoot = exports.changeHotShootTimer = exports.getHotShoot = void 0;
const HotShoot_1 = __importDefault(require("../model/HotShoot"));
const changeHotShootPromotion_1 = __importDefault(require("../middleware/externalFunctions/hotShootPromotion/changeHotShootPromotion"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const schedule = __importStar(require("node-schedule"));
//-------Schedule HotShootPromotion automatic change
//morning Promotion
schedule.scheduleJob('58 59 09 * * *', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, changeHotShootPromotion_1.default)(700);
        console.log(response);
    });
});
//evening Promotion
schedule.scheduleJob('58 59 21 * * *', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, changeHotShootPromotion_1.default)(500);
        console.log(response);
    });
});
const getHotShoot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    try {
        const hotShoot = (yield HotShoot_1.default.find({}).lean())[0];
        productForHotShoot = hotShoot.promotion;
        return res.status(200).json(productForHotShoot);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.getHotShoot = getHotShoot;
const changeHotShootTimer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    try {
        const response = yield (0, changeHotShootPromotion_1.default)(600);
        console.log(response);
        return res.status(200).json(response);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.changeHotShootTimer = changeHotShootTimer;
const setHotShoot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    res.status(200).json({ message: 'Hot Shoot promotion set', send: req.body });
});
exports.setHotShoot = setHotShoot;
