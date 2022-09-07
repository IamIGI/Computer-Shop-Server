const Users = require('../model/Users');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const bcrypt = require('bcrypt');
const { logEvents } = require('../middleware/logEvents');

const getUserData = async (req, res) => {
    console.log(req.originalUrl);
    const { userId } = req.body;

    const user = await Users.findOne({ _id: userId }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });

    console.log(`User: ${userId} data send`);
    return res.status(200).json(user);
};

const updateAccountData = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { _id, fieldName, password } = req.body;
    let { edited } = req.body;

    const user = await Users.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(406).json({ message: `Wrong password for user: ${_id}` });

    try {
        if (fieldName === 'hashedPassword') edited = await bcrypt.hash(edited, 10);

        result = await Users.updateOne({ _id }, { [`${fieldName}`]: edited });
        logEvents(`Status: 202\t UserID: ${_id}.\t Account field updated: ${fieldName}`, `reqLog.Log`);
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
                    email,
                    sms,
                    phone,
                    adjustedOffers,
                },
            }
        );
        logEvents(`Status: 202\t UserID: ${_id}.\t Account enlistments updated.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${_id}.  Account enlistments updated.` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

const deleteUser = async (req, res) => {
    console.log(`${req.originalUrl}`);
    let { _id, password } = req.body;

    const user = await Users.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(406).json({ message: `Wrong password for user: ${_id}` });

    try {
        result = await user.deleteOne({ _id });
        logEvents(`Status: 202\t UserID: ${_id}.\t Account was deleted.`, `reqLog.Log`);
        res.status(202).json({ message: `UserID: ${_id}. Account was deleted` });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    getUserData,
    updateAccountData,
    updateEnlistments,
    deleteUser,
};
