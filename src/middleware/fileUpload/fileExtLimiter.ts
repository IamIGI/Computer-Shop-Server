import { NextFunction, Response, Request } from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';

const fileExtLimiter = (allowedExtArray: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let files = req.files as fileUpload.FileArray;
        if (Boolean(files)) {
            const fileExtensions: string[] = [];
            Object.keys(files!).forEach((key) => {
                fileExtensions.push(
                    path.extname((files[key as keyof typeof files] as fileUpload.UploadedFile).name.toLowerCase())
                );
            });

            //Are the file extensions allowed?
            const allowed = fileExtensions.every((ext) => allowedExtArray.includes(ext));

            if (!allowed) {
                const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(
                    ',',
                    ', '
                );

                return res.status(200).json({ status: 'error', message, code: '003' });
            }
        }

        next();
    };
};

export default fileExtLimiter;
