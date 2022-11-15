import Users from '../model/Users';
import Orders from '../model/Orders';
import { apiErrorHandler } from '../middleware/errorHandlers';
import format from 'date-fns/format';
import orderPDF from '../middleware/pdfCreator/orderInvoice';

import { Request, Response } from 'express';
const makeOrder = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    const newOrder = new Orders({
        status: 1,
        products: doc.products,
        transactionInfo: {
            date: format(new Date(), 'yyyy.MM.dd:HH.mm.ss'),
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
                comment: doc.transactionInfo.recipientDetails.comment,
            },
        },
    });

    try {
        const result = await newOrder.save();
        //check if user data send?
        if (Boolean(doc.user)) {
            console.log('UserOrder: Checking if user exists');
            const user = await Users.findOne({ _id: doc.user }).exec();
            if (!user) return res.status(406).json({ message: 'No user found' });
            console.log('UserOrder: Updating user data');
            await Users.updateOne(
                { _id: doc.user },
                {
                    $push: { userOrders: result._id },
                }
            );
            console.log({ message: 'Successfully save new order to userAccount', OrderId: `${result._id}` });
            return res.status(201).json({
                message: 'Successfully save new order to userAccount',
                OrderId: `${result._id}`,
            });
        } else {
            console.log({ message: 'Successfully save new order ', OrderId: `${result._id}` });
            return res.status(201).json({
                message: 'Successfully save new order ',
                OrderId: `${result._id}`,
            });
        }
    } catch (err: any) {
        apiErrorHandler(req, res, err as Error);
    }
};
const getUserHistory = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { userId, pageNr } = req.body;

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
        function (err: object, msg: object) {
            if (!err) {
                console.log(`Status: 200, msg: User ${userId} order history sent.`);
                res.status(200).json({ orderData: msg, orderCount: countOrders });
            } else {
                apiErrorHandler(req, res, err as Error);
            }
        }
    );
};
const getUserHistoryItem = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const orderId = req.params.orderId;
    Orders.find({ _id: orderId }, function (err: object[], msg: object[]) {
        //dopytac
        if (!err) {
            console.log(`Status: 200, msg: User order item send`);
            console.log(msg[0]);
            res.status(200).send(msg[0]);
        } else {
            apiErrorHandler(req, res, err as unknown as Error);
        }
    });
};
const getOrderPDF = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const orderId = req.params.orderId;

    try {
        const response = await Orders.find({ _id: orderId }).exec();
        const orderData = response[0];
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=Faktura_${orderData._id}.pdf`,
        });

        orderPDF.buildPDF(
            (chunk: any) => stream.write(chunk),
            () => stream.end(),
            orderData
        );

        console.log({ msg: 'Send order invoice (PDF) successfully', orderId: orderData._id });
    } catch (err: any) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { makeOrder, getUserHistory, getUserHistoryItem, getOrderPDF };
