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
const Contact_1 = __importDefault(require("../model/Contact"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const format_1 = __importDefault(require("date-fns/format"));
const contact_services_1 = __importDefault(require("../services/contact.services"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    //category: 0 - error, 1 - cooperation
    const files = req.files;
    const { name, email, message, category } = req.body;
    console.log(name, email, message, category);
    const date = (0, format_1.default)(new Date(), 'yyyy.MM.dd-HH:mm:ss');
    if (yield contact_services_1.default.validateMessage(name)) {
        return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: '002' });
    }
    if (yield contact_services_1.default.validateMessage(message)) {
        return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: '001' });
    }
    let { added, images } = contact_services_1.default.checkForImages(files);
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
        const response = yield newMessage.save();
        contact_services_1.default.saveImages(files, response._id, category);
        console.log({ status: 'success', message: 'new message to author', date, code: '000' });
        res.status(200).json({ status: 'success', message: 'new message to author', date, code: '000' });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.default = { sendMessage };
