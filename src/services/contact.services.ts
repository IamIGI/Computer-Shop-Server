import ForbiddenWords from '../model/ForbiddenWords';
import fileUpload from 'express-fileupload';
import path from 'path';

interface fileRequest extends fileUpload.UploadedFile {
    name: string;
    files: any;
}

/** check if message contain vulgar language */
async function validateMessage(message: string): Promise<boolean> {
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (message.includes(forbiddenWords[i])) {
            return true;
        }
    }
    return false;
}

/** create images array if images where send by user */
function checkForImages(files: fileRequest[]): { added: boolean; images: string[] } {
    let added = false;
    let images: string[] = [];

    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push((files[key as keyof typeof files] as fileUpload.UploadedFile).name);
        });
    }

    return { added, images };
}

/** save files in serer folder */
function saveImages(files: fileRequest[], messageId: string, messageCategory: string): void {
    if (Boolean(files)) {
        const category = messageCategory === '0' ? 'errors' : 'collaboration';
        Object.keys(files).forEach((key) => {
            const filepath = path.join(
                __dirname,
                `../files/contactAuthor/${category}/${messageId}`,
                (files[key as keyof typeof files] as fileUpload.UploadedFile).name
            );
            (files[key as keyof typeof files] as fileUpload.UploadedFile).mv(filepath);
        });
    }
}

export default { validateMessage, checkForImages, saveImages };
