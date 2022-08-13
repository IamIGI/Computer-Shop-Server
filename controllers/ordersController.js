const Users = require('../model/Users');
const Orders = require('../model/Orders');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const makeOrder = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    const newOrder = new Orders({
        products: doc.products,
        transactionInfo: {
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
            const user = await Users.findOne({ _id: doc.user }).exec();
            if (!user) return user;

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

module.exports = {
    makeOrder,
};
