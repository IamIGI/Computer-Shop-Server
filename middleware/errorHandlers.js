"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiErrorHandler = exports.errorHandler = void 0;
const logEvents_1 = require("./logEvents");
const errorHandler = (err, req, res) => {
    (0, logEvents_1.logEvents)(`${err.name}: ${err.message}`, `errLog.Log`);
    console.error(err.stack);
    res.status(500).send(err.message);
};
exports.errorHandler = errorHandler;
const apiErrorHandler = (req, res, err) => {
    (0, logEvents_1.logEvents)(`${req.method}\t${req.headers.origin}\t${req.originalUrl}\t ${err}`, `errApiLog.Log`);
    console.log(`Status: 500 \t ${req.originalUrl}\t ${err}`);
    return res.status(500).json({ message: err.message });
};
exports.apiErrorHandler = apiErrorHandler;
