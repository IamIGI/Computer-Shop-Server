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
const Orders_1 = __importDefault(require("../model/Orders"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const format_1 = __importDefault(require("date-fns/format"));
const orderInvoice_1 = __importDefault(require("../middleware/pdfCreator/orderInvoice"));
const orders_services_1 = __importDefault(require("../services/orders.services"));
const promoCodes_services_1 = __importDefault(require("../services/promoCodes.services"));
function assignPromoCodeToUser(promoCodeIsUsed, userId, code) {
    return __awaiter(this, void 0, void 0, function* () {
        // save discount promoCode to userAccount
        if (promoCodeIsUsed && !(yield promoCodes_services_1.default.isCodeAlreadyBeenUsedByUser(code, userId))) {
            yield promoCodes_services_1.default.assignPromoCodesToUser(userId, code);
        }
    });
}
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
        const response = yield orders_services_1.default.saveOrder(newOrder, doc.user);
        yield assignPromoCodeToUser(doc.usedPromoCode.isUsed, doc.user, doc.usedPromoCode.code);
        if (response.OrderId) {
            yield orders_services_1.default.updateUserActivityOnGivenProduct(doc.user, doc.products, response.OrderId);
        }
        return res.status(response.status).json({ message: response.message, OrderId: response.OrderId });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const getUserHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { userId, pageNr } = req.body;
    try {
        const response = yield orders_services_1.default.accountOrderHistory(userId, pageNr);
        return res
            .status(response.status)
            .json({ message: response.message, orderData: response.orderData, orderCount: response.orderCount });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const getUserHistoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const orderId = req.params.orderId;
    Orders_1.default.find({ _id: orderId }, function (err, msg) {
        if (!err) {
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
