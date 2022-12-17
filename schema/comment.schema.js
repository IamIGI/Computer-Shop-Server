"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductPDFSchema = exports.getProductSchema = void 0;
const zod_1 = require("zod");
const params = {
    params: (0, zod_1.object)({
        code: (0, zod_1.string)({
            required_error: 'product code is required',
        }),
    }),
};
exports.getProductSchema = (0, zod_1.object)(Object.assign({}, params));
exports.getProductPDFSchema = (0, zod_1.object)(Object.assign({}, params));
