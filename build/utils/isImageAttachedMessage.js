"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** create images array if images where send by user */
function imageAttachedToMessage(files) {
    let added = false;
    let images = [];
    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push(files[key].name);
        });
    }
    return { added, images };
}
exports.default = imageAttachedToMessage;
