const User = require('../model/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { apiErrorHandler } = require('../middleware/errorHandlers');

const handleLogin = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { email, hashedPassword } = req.body;

    if (!email || !hashedPassword) return res.status(400).json({ message: 'Username and password are required.' });

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.status(401).json({ message: `No user match given email: ${email}` });

    const match = await bcrypt.compare(hashedPassword, foundUser.hashedPassword);
    if (match) {
        try {
            //creating Tokens
            const accessToken = jwt.sign({ _id: foundUser._id }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '30s', //change to 5 min in production
            });

            const refreshToken = jwt.sign({ _id: foundUser._id }, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: '1d',
            });

            const result = await foundUser.updateOne({ refreshToken: refreshToken });
            console.log(result);

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                // sameSite: 'None',
                // secure: true,
                maxAge: 24 * 50 * 60 * 1000,
            });

            res.status(200).json({ message: 'Log in successfully', token: accessToken });
        } catch (err) {
            apiErrorHandler(req, res, err);
        }
    } else {
        res.sendStatus(401);
    }
};

module.exports = {
    handleLogin,
};
