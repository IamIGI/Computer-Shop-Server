import allowedOrigins from '../config/allowedOrigins';
import { Request, Response, NextFunction } from 'express';

const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin!;
    if (allowedOrigins.includes(origin)) {
        //@ts-ignore
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
};

export default credentials;
