"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
/** save files in serer folder */
function saveImages(files, messageId, messageCategory) {
    if (Boolean(files)) {
        const category = messageCategory === '0' ? 'errors' : 'collaboration';
        Object.keys(files).forEach((key) => {
            const filepath = path_1.default.join(__dirname, `../files/contactAuthor/${category}/${messageId}`, files[key].name);
            files[key].mv(filepath);
        });
    }
}
exports.default = { saveImages };
