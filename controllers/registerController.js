const Users = require('../model/Users');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const bcrypt = require('bcrypt');

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
    const duplicateFirstName = await Users.findOne({ firstName }).exec();
    if (duplicateEmail || duplicateFirstName) return res.sendStatus(409);
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
            refreshToken: '',
        });
        console.log(result);
        res.status(201).json({ success: `New user ${firstName} created!` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    handleNewUser,
};
