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
exports.sendMessage = void 0;
const Contact_1 = __importDefault(require("../model/Contact"));
const ForbiddenWords_1 = __importDefault(require("../model/ForbiddenWords"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const dataFns = __importStar(require("date-fns"));
const { format } = dataFns;
const path = __importStar(require("path"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    //category: 0 - error, 1 - cooperation
    const files = req.files;
    const { name, email, message, category } = req.body;
    const date = format(new Date(), 'yyyy.MM.dd-HH:mm:ss');
    //validate message
    //Check for vulgar and offensive content
    const forbiddenWords = (yield ForbiddenWords_1.default.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (name.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: 002 });
        }
    }
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (message.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: 001 });
        }
    }
    let added = false;
    let images = [];
    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            // console.log(files[key].name);
            images.push(files[key].name);
        });
    }
    //save message
    const newMessage = new Contact_1.default({
        name,
        email,
        date,
        message,
        category,
        image: {
            added,
            images,
        },
    });
    try {
        // save text data of the message
        const response = yield newMessage.save();
        // save files data of the message
        if (Boolean(files)) {
            Object.keys(files).forEach((key) => {
                const filepath = path.join(__dirname, `../files/contactAuthor/errors/${response._id}`, files[key].name);
                files[key].mv(filepath, (err) => {
                    if (err)
                        return console.log({ status: 'error', message: err });
                    if (err)
                        return res.status(400).json({ status: 'error', message: err });
                });
            });
        }
        console.log({ status: 'success', message: 'new message to author', date, code: 000 });
        res.status(200).json({ status: 'success', message: 'new message to author', date, code: 000 });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.sendMessage = sendMessage;
