import OrderModel from '../model/Orders';
import { apiErrorHandler } from '../middleware/errorHandlers';
import format from 'date-fns/format';
import orderPDF from '../middleware/pdfCreator/orderInvoice';
import ordersServices from '../services/orders.services';

import { Request, Response } from 'express';
import promoCodesServices from '../services/promoCodes.services';

async function assignPromoCodeToUser(promoCodeIsUsed: boolean, userId: string, code: string): Promise<void> {
    // save discount promoCode to userAccount
    if (promoCodeIsUsed && !(await promoCodesServices.isCodeAlreadyBeenUsedByUser(code, userId))) {
        await promoCodesServices.assignPromoCodesToUser(userId, code);
    }
}

const makeOrder = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    const newOrder = new OrderModel({
        status: 1,
        products: doc.products,
        transactionInfo: {
            date: format(new Date(), 'yyyy.MM.dd:HH.mm.ss'),
            deliveryMethod: doc.transactionInfo.deliveryMethod,
            paymentMethod: doc.transactionInfo.paymentMethod,
            price: doc.transactionInfo.price,
            isDiscount: false,
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
        const response = await ordersServices.saveOrder(newOrder, doc.user);

        await assignPromoCodeToUser(doc.usedPromoCode.isUsed, doc.user, doc.usedPromoCode.code);

        if (response.OrderId) {
            await ordersServices.updateUserActivityOnGivenProduct(doc.user, doc.products, response.OrderId);
        }

        return res.status(response.status).json({ message: response.message, OrderId: response.OrderId });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getUserHistory = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { userId, pageNr }: { userId: string; pageNr: number } = req.body;

    try {
        const response = await ordersServices.accountOrderHistory(userId, pageNr);

        return res
            .status(response.status)
            .json({ message: response.message, orderData: response.orderData, orderCount: response.orderCount });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getUserHistoryItem = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const orderId = req.params.orderId;
    OrderModel.find({ _id: orderId }, function (err: object[], msg: object[]) {
        if (!err) {
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
        const response = await OrderModel.find({ _id: orderId }).exec();
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
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { makeOrder, getUserHistory, getUserHistoryItem, getOrderPDF };
