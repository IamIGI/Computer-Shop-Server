import Contents from '../model/Contents';
import { apiErrorHandler } from '../middleware/errorHandlers';
import { Request, Response } from 'express';

const getAboutPageData = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    try {
        const response = await Contents.findOne({ pageName: 'About' }).lean();
        return res.status(200).json(response);
    } catch (err: any) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

export default { getAboutPageData };
