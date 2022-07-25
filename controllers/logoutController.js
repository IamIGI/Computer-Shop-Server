const User = require('../model/Users');
const path = require('path');
const fsPromises = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '..', '.emv') });

const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', {
            httpOnly: true,
            // sameSite: 'None',
            // secure: true,
            maxAge: 24 * 50 * 60 * 1000,
        });
        return res.status(200).json({ message: 'Erased JWT cookie nad user refreshToken propriety', user: 'logout' });
    }
    //Delete refresh Token in db
    await foundUser.updateOne({ refreshToken: '' });
    res.clearCookie('jwt', {
        httpOnly: true,
        // sameSite: 'None',
        // secure: true,
        maxAge: 24 * 50 * 60 * 1000,
    });
    return res.status(200).json({ message: 'Erased JWT cookie nad user refreshToken propriety', user: 'logout' });
};

module.exports = { handleLogout };
