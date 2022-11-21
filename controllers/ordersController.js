"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Users_1 = __importDefault(require("../model/Users"));
const Orders_1 = __importDefault(require("../model/Orders"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const format_1 = __importDefault(require("date-fns/format"));
const orderInvoice_1 = __importDefault(require("../middleware/pdfCreator/orderInvoice"));
const makeOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    const newOrder = new Orders_1.default({
        status: 1,
        products: doc.products,
        transactionInfo: {
            date: (0, format_1.default)(new Date(), 'yyyy.MM.dd:HH.mm.ss'),
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
        const result = yield newOrder.save();
        //check if user data send?
        if (Boolean(doc.user)) {
            console.log('UserOrder: Checking if user exists');
            const user = yield Users_1.default.findOne({ _id: doc.user }).exec();
            if (!user)
                return res.status(406).json({ message: 'No user found' });
            console.log('UserOrder: Updating user data');
            yield Users_1.default.updateOne({ _id: doc.user }, {
                $push: { userOrders: result._id },
            });
            console.log({ message: 'Successfully save new order to userAccount', OrderId: `${result._id}` });
            return res.status(201).json({
                message: 'Successfully save new order to userAccount',
                OrderId: `${result._id}`,
            });
        }
        else {
            console.log({ message: 'Successfully save new order ', OrderId: `${result._id}` });
            return res.status(201).json({
                message: 'Successfully save new order ',
                OrderId: `${result._id}`,
            });
        }
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const getUserHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { userId, pageNr } = req.body;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return res.status(406).json({ message: 'No user found' });
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
    Orders_1.default.find({ _id: { $in: [userOrders[0], userOrders[1], userOrders[2], userOrders[3], userOrders[4]] } }, function (err, msg) {
        if (!err) {
            console.log(`Status: 200, msg: User ${userId} order history sent.`);
            res.status(200).json({ orderData: msg, orderCount: countOrders });
        }
        else {
            (0, errorHandlers_1.apiErrorHandler)(req, res, err);
        }
    });
});
const getUserHistoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const orderId = req.params.orderId;
    Orders_1.default.find({ _id: orderId }, function (err, msg) {
        //dopytac
        if (!err) {
            console.log(`Status: 200, msg: User order item send`);
            console.log(msg[0]);
            res.status(200).send(msg[0]);
        }
        else {
            (0, errorHandlers_1.apiErrorHandler)(req, res, err);
        }
    });
});
const getOrderPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const orderId = req.params.orderId;
    try {
        const response = yield Orders_1.default.find({ _id: orderId }).exec();
        const orderData = response[0];
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=Faktura_${orderData._id}.pdf`,
        });
        orderInvoice_1.default.buildPDF((chunk) => stream.write(chunk), () => stream.end(), orderData);
        console.log({ msg: 'Send order invoice (PDF) successfully', orderId: orderData._id });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.default = { makeOrder, getUserHistory, getUserHistoryItem, getOrderPDF };
