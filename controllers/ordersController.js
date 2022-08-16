const Users = require('../model/Users');
const Orders = require('../model/Orders');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const makeOrder = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    const newOrder = new Orders({
        status: 1,
        products: doc.products,
        transactionInfo: {
            date: format(new Date(), 'yyyy.MM.dd'),
            deliveryMethod: doc.transactionInfo.deliveryMethod,
            paymentMethod: doc.transactionInfo.paymentMethod,
            price: doc.transactionInfo.price,
            recipientDetails: {
                name: doc.transactionInfo.recipientDetails.name,
                street: doc.transactionInfo.recipientDetails.street,
                zipCode: doc.transactionInfo.recipientDetails.zipCode,
                place: doc.transactionInfo.recipientDetails.place,
                email: doc.transactionInfo.recipientDetails.email,
                phone: doc.transactionInfo.recipientDetails.phone,
            },
        },
    });

    newOrder.save(async (err, result) => {
        if (!err) {
            console.log('UserOrder: Checking if user exists');
            console.log(doc);
            const user = await Users.findOne({ _id: doc.user }).exec();
            if (!user) return res.status(406).json({ message: 'No user found' });
            console.log('UserOrder: Updating user data');
            await Users.updateOne(
                { _id: doc.user },
                {
                    $push: { userOrders: result._id },
                }
            );

            res.status(201).json({ message: 'Successfully save new order', OrderId: `${result._id}` });
            console.log({ message: 'Successfully save new order', OrderId: `${result._id}` });
            return result._id;
        } else {
            apiErrorHandler(req, res, err);
        }
    });
};

const getUserHistory = async (req, res) => {
    console.log(`${req.originalUrl}`);
    console.log(`Body: ${JSON.stringify(req.body)}`);
    const { userId, pageNr } = req.body;
    console.log(`UserOrderHistory, parameters:\n UserId:  ${userId},\t pageNr: ${pageNr}`);

    const user = await Users.findOne({ _id: userId }).exec();
    if (!user) return res.status(406).json({ message: 'No user found' });
    console.log('Searching for user order history');
    const a = pageNr * 5 - 4 - 1;
    const b = pageNr * 5 - 1;
    let userOrders = [];
    for (let i = a; i <= b; i++) {
        // let product_id = JSON.stringify(user.userOrders[i]).split('"')[1];
        let product_id = user.userOrders[i];
        userOrders.push(product_id);
    }
    console.log(`User orders: ${userOrders}`);
    const countOrders = user.userOrders.length;
    Orders.find(
        { _id: { $in: [userOrders[0], userOrders[1], userOrders[2], userOrders[3], userOrders[4]] } },
        function (err, msg) {
            if (!err) {
                console.log(`Status: 200, msg: User ${userId} order history sent.`);
                res.status(200).json({ orderData: msg, orderCount: countOrders });
            } else {
                apiErrorHandler(req, res, err);
            }
        }
    );
};

const getUserHistoryItem = async (req, res) => {
    console.log(`${req.originalUrl}`);
    console.log(`Params: ${JSON.stringify(req.params.orderId)}`);
    const orderId = req.params.orderId;
    console.log(`UserOrderItem: ${orderId},`);
    console.log('Searching for user order item data');
    Orders.find({ _id: orderId }, function (err, msg) {
        if (!err) {
            console.log(`Status: 200, msg: User order find ${orderId}`);
            res.status(200).json({ msg });
        } else {
            apiErrorHandler(req, res, err);
        }
    });
};

module.exports = {
    makeOrder,
    getUserHistory,
    getUserHistoryItem,
};
