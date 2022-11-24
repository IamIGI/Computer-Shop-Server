import Contact from '../model/Contact';
import { apiErrorHandler } from '../middleware/errorHandlers';
import format from 'date-fns/format';
import { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import contactServices from '../services/contact.services';
import validateMessage from '../utils/validateMessage';
import imageAttachedToMessage from '../utils/isImageAttachedMessage';

interface fileRequest extends fileUpload.UploadedFile {
    name: string;
    files: any;
}

const sendMessage = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const files = req.files as fileUpload.FileArray;
    const { name, email, message, category } = req.body;
    const date = format(new Date(), 'yyyy.MM.dd-HH:mm:ss');

    if (await validateMessage(name)) {
        return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: '002' });
    }

    if (await validateMessage(message)) {
        return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: '001' });
    }

    let { added, images } = imageAttachedToMessage(files);

    const newMessage = new Contact({
        name,
        email,
        date,
        message,
        category,
        image: {
            added,
            images,
        },
    });

    try {
        const response = await newMessage.save();

        contactServices.saveImages(files, response._id, category);

        console.log({ status: 'success', message: 'new message to author', date, code: '000' });
        res.status(200).json({ status: 'success', message: 'new message to author', date, code: '000' });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { sendMessage };
