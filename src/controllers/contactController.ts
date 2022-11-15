import Contact from '../model/Contact';
import ForbiddenWords from '../model/ForbiddenWords';
import { apiErrorHandler } from '../middleware/errorHandlers';
import format from 'date-fns/format';
import path from 'path';
import { Request, Response } from 'express';
import fileUpload from 'express-fileupload';

interface fileRequest extends fileUpload.UploadedFile {
    name: any;
    files: any;
}

const sendMessage = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    //category: 0 - error, 1 - cooperation
    const files = req.files as unknown as fileRequest[];
    const { name, email, message, category } = req.body;
    const date = format(new Date(), 'yyyy.MM.dd-HH:mm:ss');
    //validate message
    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (name.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: '002' });
        }
    }
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (message.includes(forbiddenWords[i])) {
            return res
                .status(200)
                .json({ message: 'Given content contains vulgar and offensive content', code: '001' });
        }
    }

    let added = false;
    let images: string[] = []; // ? is it working?

    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            images.push((files[key as keyof typeof files] as fileUpload.UploadedFile).name);
        });
    }

    //save message
    const newMessage = new Contact({
        name,
        email,
        date,
        message,
        category,
        image: {
            added,
            images, //dopytac
        },
    });

    try {
        // save text data of the message
        const response = await newMessage.save();
        // save files data of the message

        if (Boolean(files)) {
            Object.keys(files).forEach((key) => {
                const filepath = path.join(
                    __dirname,
                    `../files/contactAuthor/errors/${response._id}`,
                    (files[key as keyof typeof files] as fileUpload.UploadedFile).name
                );
                (files[key as keyof typeof files] as fileUpload.UploadedFile).mv(filepath, (err: object) => {
                    if (err) return console.log({ status: 'error', message: err });
                    if (err) return res.status(400).json({ status: 'error', message: err });
                });
            });
        }

        console.log({ status: 'success', message: 'new message to author', date, code: '000' });
        res.status(200).json({ status: 'success', message: 'new message to author', date, code: '000' });
    } catch (err: any) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { sendMessage };
