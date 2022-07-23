const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config(path.join(__dirname, '..', '.env'));

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'missing authorization token' });
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
        if (err) return res.status(403).json(err);
        req.user = decodedToken.email;
        next();
    });
};

module.exports = verifyJWT;
