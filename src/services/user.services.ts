import UserModel from '../model/Users';

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
    phone: number
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
    phone: number
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

export default {
    allowRecipientTemplate,
    updateRecipientDetailsTemplates,
    replaceRecipientDetailsTemplate,
    updateEnlistments,
};
