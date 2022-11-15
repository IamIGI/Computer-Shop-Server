import User from '../model/Users';
import path from 'path';
// const fsPromises = require('fs').promises; //what with that ?
import { Request, Response } from 'express';

require('dotenv').config({ path: path.join(__dirname, '..', '.emv') });

const handleLogout = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 24 * 50 * 60 * 1000,
        });
        return res.status(200).json({ message: 'Erased JWT cookie nad user refreshToken propriety', user: 'logout' });
    }
    //Delete refresh Token in db
    await foundUser.updateOne({ refreshToken: '' });
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 50 * 60 * 1000,
    });
    return res.status(200).json({ message: 'Erased JWT cookie nad user refreshToken propriety', user: 'logout' });
};

export default { handleLogout };
