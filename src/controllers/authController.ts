import { RequestHandler } from 'express';
import User from '../model/Users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
import { apiErrorHandler } from '../middleware/errorHandlers';
import { logEvents } from '../middleware/logEvents';

const handleLogin: RequestHandler = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { email, hashedPassword } = req.body;

    if (!email || !hashedPassword) return res.status(400).json({ message: 'Username and password are required.' });

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.status(401).json({ message: `No user match given email: ${email}` });

    const match = await bcrypt.compare(hashedPassword, foundUser.hashedPassword);
    if (match) {
        console.log(foundUser._id);
        const roles = Object.values(foundUser.roles);
        try {
            //creating Tokens
            const accessToken = jwt.sign(
                { _id: foundUser._id, roles: roles },
                process.env.ACCESS_TOKEN_SECRET as string,
                {
                    expiresIn: process.env.REFRESH_ACCESS_TOKEN_TIME, //change to 5 min (5m) in production
                }
            );

            const refreshToken = jwt.sign({ _id: foundUser._id }, process.env.REFRESH_TOKEN_SECRET as string, {
                expiresIn: process.env.REFRESH_REFRESH_TOKEN_TIME,
            });

            // save refreshToken = log in user
            await foundUser.updateOne({ refreshToken: refreshToken });

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true, //back when running on chrome.
                maxAge: 24 * 50 * 60 * 1000,
            });

            console.log(`$Status: 200\t User_Id: ${foundUser._id}\t Logged successfully`);
            logEvents(
                `$Status: 200\t User_Id: ${foundUser._id}\t Logged successfully\t token : ${accessToken}`,
                'reqLog.Log'
            );

            res.status(200).json({
                message: 'Log in successfully',
                id: foundUser._id,
                userName: foundUser.firstName,
                roles: roles,
                accessToken: accessToken,
            });
        } catch (err) {
            apiErrorHandler(req, res, err as Error);
        }
    } else {
        res.status(406).json({ message: `Wrong password for: ${email}` });
    }
};

export default { handleLogin };
