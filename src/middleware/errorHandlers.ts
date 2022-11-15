import { logEvents } from './logEvents';
import { Response, Request } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response) => {
    logEvents(`${err.name}: ${err.message}`, `errLog.Log`);
    console.error(err.stack);
    res.status(500).send(err.message);
};

export const apiErrorHandler = (req: Request, res: Response, err: Error) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.originalUrl}\t ${err}`, `errApiLog.Log`);
    console.log(`Status: 500 \t ${req.originalUrl}\t ${err}`);
    return res.status(500).json({ message: err.message });
};
