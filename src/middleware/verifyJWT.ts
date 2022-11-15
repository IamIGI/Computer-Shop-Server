import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
require('dotenv').config(path.join(__dirname, '..', '.env'));
import { Request, Response, NextFunction } from 'express';
import { Roles } from '../config/roles_list';

interface JwtPayloadInput {
    email: string;
    roles: {
        User: number;
        Admin: number;
        Editor: number;
    };
}

export interface CustomRequestJWT extends Request {
    user: string | JwtPayload;
    roles: Roles;
}

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.originalUrl);
    const authHeader = (req.headers.authorization as string) || (req.headers.Authorization as string);
    console.log(`Token: ${authHeader}`);
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'missing authorization token' });
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decodedToken) => {
        if (err) return res.status(403).json({ message: 'Invalid token (forbidden)', error: `${err}` });
        console.log('Token validated correctly ');
        (req as CustomRequestJWT).user = (decodedToken! as JwtPayloadInput).email;
        (req as CustomRequestJWT).roles = (decodedToken! as JwtPayloadInput).roles;
        next();
    });
};

export default verifyJWT;
