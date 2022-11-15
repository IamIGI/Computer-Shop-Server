import { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';

const MB = 1; // in MB
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

const fileSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as fileUpload.FileArray;
    //  if (Boolean(files)) {
    if (files) {
        const filesOverLimit: string[] = [];
        //Which files are over the limit?
        Object.keys(files).forEach((key) => {
            if ((files[key as keyof typeof files] as fileUpload.UploadedFile).size > FILE_SIZE_LIMIT) {
                //dopytac
                filesOverLimit.push((files[key as keyof typeof files] as fileUpload.UploadedFile).name);
            }
        });

        if (filesOverLimit.length) {
            const properVerb = filesOverLimit.length > 1 ? 'are' : 'is';

            const sentence =
                `Upload failed. ${filesOverLimit.toString()} ${properVerb} over the file size limit of ${MB} MB.`.replaceAll(
                    ',',
                    ', '
                );

            const message =
                filesOverLimit.length < 3 ? sentence.replace(',', ' and') : sentence.replace(/,(?=[^,]*$)/, ' and');

            return res.status(200).json({ status: 'error', message, code: '004' });
        }
    }

    next();
};

export default fileSizeLimiter;
