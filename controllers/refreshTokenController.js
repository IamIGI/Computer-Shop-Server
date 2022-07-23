const User = require('../model/Users');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser)
        return res.status(403).json({ message: 'given refreshToken does not match to any user refreshToken' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decodedToken) => {
        const user_id_db = JSON.stringify(foundUser._id).split('"')[1];
        // console.log(foundUser._id, decodedToken._id);
        if (err || user_id_db !== decodedToken._id)
            return res
                .status(403)
                .json(err ? { message: `JWT-error ${err}` } : { message: `JWT Verify: Users are not the same` });

        // refresh ACCESS_TOKEN
        const accessToken = jwt.sign({ _id: foundUser._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '30s', //change to 5 min in production
        });
        res.json({ accessToken });
    });
};

module.exports = { handleRefreshToken };
