import User from '../model/Users';
import jwt from 'jsonwebtoken';
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
import { Request, Response } from 'express';

interface CustomDecodedToken {
    _id: string;
}

const handleRefreshToken = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const cookies = req.cookies as { jwt: string; _id: string };
    if (!cookies?.jwt) return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser)
        return res.status(403).json({ message: 'given refreshToken does not match to any user refreshToken' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err, decodedToken) => {
        const user_id_db = JSON.stringify(foundUser._id).split('"')[1];

        if (err || user_id_db !== (decodedToken as CustomDecodedToken)._id)
            return res
                .status(403)
                .json(err ? { message: `JWT-error ${err}` } : { message: `JWT Verify: Users are not the same` });

        const id = user_id_db;
        const userName = foundUser.firstName;
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign({ _id: foundUser._id, roles: roles }, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: process.env.REFRESH_ACCESS_TOKEN_TIME, //change to 5 min in production
        });
        const email = foundUser.email;
        res.json({ id, userName, roles, accessToken, email });
    });
};

export default { handleRefreshToken };
