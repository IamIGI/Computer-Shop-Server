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
const Users_1 = __importDefault(require("../model/Users"));
function checkForDiscount(order) {
    for (let i = 0; i < order.products.length; i++) {
        if (order.products[i].isDiscount) {
            order.transactionInfo.isDiscount = true;
        }
    }
    return order;
}
/** Save order to db */
function saveOrder(newOrder, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        newOrder = checkForDiscount(newOrder);
        const result = yield newOrder.save(); // save to orders collection
        if (userId) {
            const user = yield Users_1.default.findOne({ _id: userId }).exec();
            if (!user)
                return { status: 406, message: 'No user found' };
            yield Users_1.default.updateOne({ _id: userId }, {
                $push: { userOrders: result._id },
            });
            return { status: 201, message: 'Successfully save new order to userAccount', OrderId: result._id };
        }
        return { status: 201, message: 'Successfully save new order', OrderId: result._id };
    });
}
/** return user order history  */
function accountOrderHistory(userId, pageNr) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield Users_1.default.findOne({ _id: userId }).exec();
        if (!user)
            return { status: 406, message: 'No user found' };
        const a = pageNr * 5 - 4 - 1;
        const b = pageNr * 5 - 1;
        let userOrders = [];
        for (let i = a; i <= b; i++) {
            let product_id = user.userOrders[i];
            userOrders.push(product_id);
        }
        try {
            const response = yield Orders_1.default.find({
                _id: { $in: [userOrders[0], userOrders[1], userOrders[2], userOrders[3], userOrders[4]] },
            });
            const countOrders = user.userOrders.length;
            return { status: 200, message: 'Account history', orderData: response, orderCount: countOrders };
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
/** check if user commented already given product or have notification to comment it already. If not update user db data: set showNotifications: true, push productIds to list of notifications */
function updateUserActivityOnGivenProduct(userId, orderedProducts) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield Users_1.default.findOne({ _id: userId }).exec();
        if (!user) {
            console.log({ err: 'user not found' });
            return;
        }
        if (user.notifications.newComment.allowNotification) {
            //merge two arrays of user products activity
            let productsCommentedOrAlreadyInNotifications = user.commentedProducts;
            if (user.notifications.newComment.productIds !== undefined) {
                productsCommentedOrAlreadyInNotifications = Array.from(new Set(user.commentedProducts.concat(user.notifications.newComment.productIds)));
            }
            let productsToComment = [];
            orderedProducts.map((product) => {
                if (!productsCommentedOrAlreadyInNotifications.includes(product._id))
                    productsToComment.push(product._id);
            });
            if (productsToComment.length === 0) {
                console.log('User already commented / have notification on given product');
                return;
            }
            try {
                yield Users_1.default.updateOne({ _id: userId }, {
                    $set: { 'notifications.newComment.showNotification': true },
                    $push: { 'notifications.newComment.productIds': productsToComment },
                });
                console.log('Update user notification data');
                console.log(productsToComment);
            }
            catch (err) {
                throw err;
            }
            return;
        }
    });
}
exports.default = { saveOrder, accountOrderHistory, updateUserActivityOnGivenProduct };
