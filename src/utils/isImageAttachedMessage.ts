import fileUpload from 'express-fileupload';
import path from 'path';

interface fileRequest extends fileUpload.UploadedFile {
    name: string;
    files: any;
}

/** create images array if images where send by user */
function imageAttachedToMessage(files: fileUpload.FileArray): { added: boolean; images: string[] } {
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

export default imageAttachedToMessage;
