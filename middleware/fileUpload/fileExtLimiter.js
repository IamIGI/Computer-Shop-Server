"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fileExtLimiter = (allowedExtArray) => {
    return (req, res, next) => {
        let files = req.files;
        if (Boolean(files)) {
            const fileExtensions = [];
            Object.keys(files).forEach((key) => {
                fileExtensions.push(path_1.default.extname(files[key].name.toLowerCase()));
            });
            //Are the file extensions allowed?
            const allowed = fileExtensions.every((ext) => allowedExtArray.includes(ext));
            if (!allowed) {
                const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(',', ', ');
                return res.status(200).json({ status: 'error', message, code: '003' });
            }
        }
        next();
    };
};
exports.default = fileExtLimiter;
