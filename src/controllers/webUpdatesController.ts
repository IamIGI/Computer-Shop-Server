import WebUpdates from '../model/WebUpdates';
import format from 'date-fns/format';
import { apiErrorHandler } from '../middleware/errorHandlers';
import webUpdatedPDF from '../middleware/pdfCreator/webUpdates';
import { Request, Response } from 'express';

const addNewUpdate = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    const { version, changes } = req.body;

    const newUpdate = new WebUpdates({
        version,
        date: format(new Date(), 'yyyy.MM.dd'),
        changes,
    });

    try {
        await newUpdate.save();
        console.log('Added new update register');
        return res.status(200).json({ message: 'Added new update register', date: format(new Date(), 'yyyy.MM.dd') });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getAllUpdates = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    try {
        const response = await WebUpdates.find({}).lean();
        console.log('List of updates returned successfully');
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

const getPDF = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    try {
        const response = await WebUpdates.find({}).lean();
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=UpdatesLogs.pdf`,
        });

        webUpdatedPDF.buildPDF(
            (chunk: any) => stream.write(chunk),
            () => stream.end(),
            response
        );
        console.log('Send update list (PDF) successfully');
    } catch (err) {
        apiErrorHandler(req, res, err as Error); //send products as a response
    }
};

export default { addNewUpdate, getAllUpdates, getPDF };
