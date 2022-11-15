import UserModel from '../model/Users';
import { apiErrorHandler } from '../middleware/errorHandlers';
import bcrypt from 'bcrypt';
import { logEvents } from '../middleware/logEvents';
import { Request, Response } from 'express';

const getUserData = async (req: Request, res: Response) => {
    console.log(req.originalUrl);
    const { userId } = req.body;
    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });

    console.log(`User: ${userId} data send`);
    return res.status(200).json(user);
};

const updateAccountData = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { _id, fieldName, password } = req.body;
    let { edited } = req.body;

    const user = await UserModel.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(406).json({ message: `Wrong password for user: ${_id}` });

    try {
        if (fieldName === 'hashedPassword') edited = await bcrypt.hash(edited, 10);

        await UserModel.updateOne({ _id }, { [`${fieldName}`]: edited });
        logEvents(`Status: 202\t UserID: ${_id}.\t Account field updated: ${fieldName}`, `reqLog.Log`);
        res.status(202).json({ success: ` UserID: ${_id}. Account field updated: ${fieldName}` });
    } catch (err: any) {
        apiErrorHandler(req, res, err);
    }
};

const updateEnlistments = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    console.log(req.body);

    const { _id, email, sms, phone, adjustedOffers } = req.body;

    const user = await UserModel.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    try {
        await UserModel.updateOne(
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
    } catch (err: any) {
        apiErrorHandler(req, res, err);
    }
};

const deleteUser = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    let { _id, password } = req.body;

    const user = await UserModel.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(406).json({ message: `Wrong password for user: ${_id}` });

    try {
        console.log('deleting user.');
        await user.deleteOne({ _id });
        logEvents(`Status: 202\t UserID: ${_id}.\t Account was deleted.`, `reqLog.Log`);
        res.status(202).json({ message: `UserID: ${_id}. Account was successfully deleted` });
    } catch (err: any) {
        apiErrorHandler(req, res, err);
    }
};

export default { getUserData, updateAccountData, updateEnlistments, deleteUser };
