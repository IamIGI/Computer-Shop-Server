const Users = require('../model/Users');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const bcrypt = require('bcrypt');
const { logEvents } = require('../middleware/logEvents');

const handleNewUser = async (req, res) => {
    console.log(`${req.originalUrl}`);

    const {
        firstName,
        lastName,
        email,
        hashedPassword,
        shopRules,
        emailEnlistments,
        smsEnlistments,
        phoneEnlistments,
        adjustedOffersEnlistments,
    } = req.body;

    if (!firstName || !hashedPassword || !email)
        return res.status(400).json({ message: 'Username, password, email are required.' });
    const duplicateEmail = await Users.findOne({ email }).exec();
    if (duplicateEmail) {
        console.log('Email already in use');
        return res.sendStatus(409);
    }
    try {
        const hashedPwd = await bcrypt.hash(hashedPassword, 10);
        const result = await Users.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: hashedPwd,
            Enlistments: {
                shopRules: shopRules,
                email: emailEnlistments,
                sms: smsEnlistments,
                phone: phoneEnlistments,
                adjustedOffers: adjustedOffersEnlistments,
            },
            roles: { User: 2001 }, //change after to make it flexible
            refreshToken: '',
            userOrders: [],
        });
        console.log(`Status: 201 success: New user ${result._id} created!`);
        logEvents(`Status: 201\t User_Id: ${result._id}\t New user created! \t`, 'reqLog.Log');
        res.status(201).json({ success: `New user ${result._id} created!` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    handleNewUser,
};
