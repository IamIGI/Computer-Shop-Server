"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const webUpdatesSchema = new Schema({
    version: String,
    date: String,
    changes: {
        added: Array,
        fixes: Array,
    },
});
exports.default = mongoose_1.default.model('WebUpdates', webUpdatesSchema);
