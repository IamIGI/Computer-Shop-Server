import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod'; //library for validating requests

interface CustomErrorOutput {
    errors: any;
}

interface CustomError extends CustomErrorOutput, Error {}

// validate request object against that schema
const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err) {
        return res.status(400).send((err as CustomError).errors);
    }
};

export default validate;
