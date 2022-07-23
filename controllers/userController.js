const Users = require('../model/Users');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const updateAccountData = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { _id, fieldName, edited } = req.body;

    const user = await Users.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    try {
        result = await Users.updateOne({ _id }, { [`${fieldName}`]: edited });
        res.status(202).json({ success: ` UserID: ${_id}. Account field updated: ${fieldName}` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

const updateEnlistments = async (req, res) => {
    console.log(`${req.originalUrl}`);

    const { _id, email, sms, phone, adjustedOffers } = req.body;

    const user = await Users.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    try {
        result = await Users.updateOne(
            { _id },
            {
                // email: podsiadlo@gmail.com
                Enlistments: {
                    shopRules: true,
                    email: email,
                    sms: sms,
                    phone: phone,
                    adjustedOffers: adjustedOffers,
                },
            }
        );
        res.status(202).json({ success: `UserID: ${_id}.  Account enlistments updated.` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

const deleteUser = async (req, res) => {
    console.log(`${req.originalUrl}`);
    let { _id } = req.body;

    const user = await Users.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    try {
        result = await user.deleteOne({ _id });
        res.status(202).json({ message: `UserID: ${_id}. Account was deleted` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    updateAccountData,
    updateEnlistments,
    deleteUser,
};
