const Orders = require('../model/Orders');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const makeOrder = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { orderTemplateDocument: doc } = req.body;

    const newOrder = new Orders({
        orderCode: doc.orderCode,
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

    newOrder.save((err) => {
        if (!err) {
            console.log('Successfully save new order');
            res.status(201).json('Successfully save new order');
        } else {
            apiErrorHandler(req, res, err);
        }
    });
};

module.exports = {
    makeOrder,
};
