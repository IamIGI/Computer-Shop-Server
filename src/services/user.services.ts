import UserModel from '../model/Users';
import { Response } from 'express';

async function allowRecipientTemplate(userId: string): Promise<boolean> {
    const user = await UserModel.findOne({ _id: userId }).exec();

    if (user!.recipientTemplates !== undefined && user!.recipientTemplates?.length > 3) {
        return false;
    }
    return true;
}

async function updateRecipientDetailsTemplates(
    userId: string,
    name: string,
    street: string,
    zipCode: string,
    place: string,
    email: string,
    phone: string
): Promise<void> {
    try {
        await UserModel.updateOne(
            { _id: userId },
            {
                $push: {
                    recipientTemplates: {
                        name,
                        street,
                        zipCode,
                        place,
                        email,
                        phone,
                    },
                },
            }
        );
    } catch (err) {
        throw err;
    }
}

async function replaceRecipientDetailsTemplate(
    userId: string,
    recipientId: string,
    name: string,
    street: string,
    zipCode: string,
    place: string,
    email: string,
    phone: string
): Promise<void> {
    try {
        await UserModel.updateOne(
            { _id: userId },
            {
                $set: {
                    'recipientTemplates.$[recipientTemplate].name': name,
                    'recipientTemplates.$[recipientTemplate].street': street,
                    'recipientTemplates.$[recipientTemplate].zipCode': zipCode,
                    'recipientTemplates.$[recipientTemplate].place': place,
                    'recipientTemplates.$[recipientTemplate].email': email,
                    'recipientTemplates.$[recipientTemplate].phone': phone,
                },
            },
            {
                arrayFilters: [
                    {
                        'recipientTemplate._id': recipientId,
                    },
                ],
            }
        );
    } catch (err) {
        throw err;
    }
}

async function updateEnlistments(
    userId: string,
    email: boolean,
    sms: boolean,
    phone: boolean,
    adjustedOffers: boolean
): Promise<void> {
    try {
        await UserModel.updateOne(
            { _id: userId },
            {
                Enlistments: {
                    shopRules: true,
                    email,
                    sms,
                    phone,
                    adjustedOffers,
                },
            }
        );
    } catch (err) {
        throw err;
    }
}

async function updateNotifications(userId: string, name: string, value: boolean): Promise<void> {
    const dynamicPath = `notifications.${name}.allowNotification`;
    try {
        await UserModel.updateOne(
            { _id: userId },
            {
                $set: {
                    [dynamicPath]: value,
                },
            }
        );
    } catch (err) {
        throw err;
    }
}

async function authenticateUser(res: Response, userId: string): Promise<boolean> {
    if (userId === undefined) {
        res.status(400).json({ message: `UserID: ${userId}.`, reason: 'No userId provided' });
        return false;
    }
    if (userId.length !== 24) {
        res.status(400).json({ message: `UserID: ${userId}.`, reason: 'Bad userId template. Required 24 chars' });
        return false;
    }

    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) {
        res.status(204).json({ message: `UserID: ${userId}.`, reason: 'Only logged user can use promo codes' });
        return false;
    }

    return true;
}

export default {
    allowRecipientTemplate,
    updateRecipientDetailsTemplates,
    replaceRecipientDetailsTemplate,
    updateEnlistments,
    authenticateUser,
    updateNotifications,
};
