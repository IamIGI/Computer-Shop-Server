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
exports.getPDF = exports.getAllUpdates = exports.addNewUpdate = void 0;
const WebUpdates_1 = __importDefault(require("../model/WebUpdates"));
const dataFns = __importStar(require("date-fns"));
const { format } = dataFns;
const errorHandlers_1 = require("../middleware/errorHandlers");
const webUpdates_1 = __importDefault(require("../middleware/pdfCreator/webUpdates"));
const addNewUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { version, changes } = req.body;
    const newUpdate = new WebUpdates_1.default({
        version,
        date: format(new Date(), 'yyyy.MM.dd'),
        changes,
    });
    try {
        const result = yield newUpdate.save();
        console.log('Added new update register');
        return res.status(200).json({ message: 'Added new update register', date: format(new Date(), 'yyyy.MM.dd') });
    }
    catch (err) {
        console.log(result);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.addNewUpdate = addNewUpdate;
const getAllUpdates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    try {
        const response = yield WebUpdates_1.default.find({}).lean();
        console.log('List of updates returned successfully');
        return res.status(200).json(response);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err); //send products as a response
    }
});
exports.getAllUpdates = getAllUpdates;
const getPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    try {
        const response = yield WebUpdates_1.default.find({}).lean();
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=UpdatesLogs.pdf`,
        });
        webUpdates_1.default.buildPDF((chunk) => stream.write(chunk), () => stream.end(), response);
        console.log('Send update list (PDF) successfully');
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err); //send products as a response
    }
});
exports.getPDF = getPDF;
