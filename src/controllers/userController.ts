import UserModel from '../model/Users';
import { apiErrorHandler } from '../middleware/errorHandlers';
import bcrypt from 'bcrypt';
import { logEvents } from '../middleware/logEvents';
import { Request, Response } from 'express';
import userServices from '../services/user.services';

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
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const updateEnlistments = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    console.log(req.body);

    const { _id, email, sms, phone, adjustedOffers } = req.body;

    const user = await UserModel.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    try {
        await userServices.updateEnlistments(_id, email, sms, phone, adjustedOffers);

        logEvents(`Status: 202\t UserID: ${_id}.\t Account enlistments updated.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${_id}.  Account enlistments updated.` });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const addRecipientTemplate = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const {
        userId,
        recipientTemplate: { name, street, zipCode, place, email, phone },
    } = req.body;

    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });

    if (!(await userServices.allowRecipientTemplate(userId)))
        return res.status(400).json({ message: `UserID: ${userId}. User can have max 4 templates` });

    try {
        await userServices.updateRecipientDetailsTemplates(userId, name, street, zipCode, place, email, phone);

        logEvents(`Status: 202\t UserID: ${userId}.\t Added new recipient template.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${userId}.  Added new recipient template.` });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getRecipientTemplate = async (req: Request, res: Response) => {
    console.log(req.originalUrl);
    const { userId } = req.body;
    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });

    console.log(`User: ${userId} data send`);
    return res.status(200).json(user.recipientTemplates);
};

const editRecipientTemplate = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const {
        userId,
        recipientId,
        recipientTemplate: { name, street, zipCode, place, email, phone },
    } = req.body;

    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });

    try {
        await userServices.replaceRecipientDetailsTemplate(
            userId,
            recipientId,
            name,
            street,
            zipCode,
            place,
            email,
            phone
        );

        logEvents(`Status: 202\t UserID: ${userId}.\t Successfully edited recipient template.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${userId}.  Successfully edited recipient template.` });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const deleteUser = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { _id, password } = req.body;

    const user = await UserModel.findOne({ _id }).exec();
    if (!user) return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });

    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) return res.status(406).json({ message: `Wrong password for user: ${_id}` });

    try {
        await user.deleteOne({ _id });
        logEvents(`Status: 202\t UserID: ${_id}.\t Account was deleted.`, `reqLog.Log`);
        res.status(202).json({ message: `UserID: ${_id}. Account was successfully deleted` });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default {
    getUserData,
    updateAccountData,
    updateEnlistments,
    deleteUser,
    addRecipientTemplate,
    getRecipientTemplate,
    editRecipientTemplate,
};
