import OrderModel, { OrderDocument } from '../model/Orders';
import { OrderedProductData } from '../model/Products';
import UserModel from '../model/Users';

function checkForDiscount(order: OrderDocument): OrderDocument {
    for (let i = 0; i < order.products.length; i++) {
        if (order.products[i].isDiscount) {
            order.transactionInfo.isDiscount = true;
        }
    }
    return order;
}

/** Save order to db */
async function saveOrder(
    newOrder: OrderDocument,
    userId: string
): Promise<{ status: number; message: string; OrderId?: string }> {
    newOrder = checkForDiscount(newOrder);

    const result = await newOrder.save(); // save to orders collection

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
/** return user order history  */
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

/** check if user commented already given product or have notification to comment it already. If not update user db data: set showNotifications: true, push productIds to list of notifications */
async function updateUserActivityOnGivenProduct(userId: string, orderedProducts: OrderedProductData[]): Promise<void> {
    const user = await UserModel.findOne({ _id: userId }).exec();

    if (!user) {
        console.log({ err: 'user not found' });
        return;
    }

    if (user.notifications.newComment.allowNotification) {
        //merge two arrays of user products activity
        let productsCommentedOrAlreadyInNotifications = user.commentedProducts;
        if (user.notifications.newComment.productIds !== undefined) {
            productsCommentedOrAlreadyInNotifications = Array.from(
                new Set(user.commentedProducts.concat(user.notifications.newComment.productIds))
            );
        }

        let productsToComment: string[] = [];
        orderedProducts.map((product) => {
            if (!productsCommentedOrAlreadyInNotifications.includes(product._id)) productsToComment.push(product._id);
        });

        if (productsToComment.length === 0) {
            console.log('User already commented / have notification on given product');
            return;
        }

        try {
            await UserModel.updateOne(
                { _id: userId },
                {
                    $set: { 'notifications.newComment.showNotification': true },
                    $push: { 'notifications.newComment.productIds': productsToComment },
                }
            );
            console.log('Update user notification data');
            console.log(productsToComment);
        } catch (err) {
            throw err;
        }
        return;
    }
}

export default { saveOrder, accountOrderHistory, updateUserActivityOnGivenProduct };
