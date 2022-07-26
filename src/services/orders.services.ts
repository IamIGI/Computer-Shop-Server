import OrderModel, { OrderDocument } from '../model/Orders';
import UserModel from '../model/Users';

/** Save order to db */
async function saveOrder(
    newOrder: OrderDocument & {
        _id: string;
    },
    userId: string
): Promise<{ status: number; message: string; OrderId?: string }> {
    const result = await newOrder.save();

    if (userId) {
        const user = await UserModel.findOne({ _id: userId }).exec();
        if (!user) return { status: 406, message: 'No user found' };
        await UserModel.updateOne(
            { _id: userId },
            {
                $push: { userOrders: result._id },
            }
        );
        return { status: 201, message: 'Successfully save new order to userAccount', OrderId: result._id };
    }

    return { status: 201, message: 'Successfully save new order', OrderId: result._id };
}

async function accountOrderHistory(
    userId: string,
    pageNr: number
): Promise<{ status: number; message: string; orderData?: OrderDocument[]; orderCount?: number }> {
    const user = await UserModel.findOne({ _id: userId }).exec();

    if (!user) return { status: 406, message: 'No user found' };
    const a = pageNr * 5 - 4 - 1;
    const b = pageNr * 5 - 1;
    let userOrders = [];
    for (let i = a; i <= b; i++) {
        let product_id = user.userOrders[i];
        userOrders.push(product_id);
    }
    try {
        const response = await OrderModel.find({
            _id: { $in: [userOrders[0], userOrders[1], userOrders[2], userOrders[3], userOrders[4]] },
        });
        const countOrders = user.userOrders.length;
        return { status: 200, message: 'Account history', orderData: response, orderCount: countOrders };
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export default { saveOrder, accountOrderHistory };
