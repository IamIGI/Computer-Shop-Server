"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filesPayloadExists = (req, res, next) => {
    if (!req.files)
        return res.status(400).json({ status: 'error', message: 'Missing files' });
    next();
};
exports.default = filesPayloadExists;
