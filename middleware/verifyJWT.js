const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config(path.join(__dirname, '..', '.env'));

const verifyJWT = (req, res, next) => {
    console.log(req);
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(`Token: ${authHeader}`);
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'missing authorization token' });
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
        if (err) return res.status(403).json({ message: 'Invalid token (forbidden)', error: `${err}` });
        console.log('Token validated correctly ');
        req.user = decodedToken.email;
        req.roles = decodedToken.roles;
        next();
    });
};

module.exports = verifyJWT;
