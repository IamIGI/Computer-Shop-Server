import fileUpload from 'express-fileupload';
import path from 'path';

interface fileRequest extends fileUpload.UploadedFile {
    name: string;
    files: any;
}

/** save files in serer folder */
function saveImages(files: fileUpload.FileArray, messageId: string, messageCategory: string): void {
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

export default { saveImages };
