"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.checkout = void 0;
const errorHandlers_1 = require("../middleware/errorHandlers");
const Products_1 = __importDefault(require("../model/Products"));
// const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
const Stripe = __importStar(require("stripe"));
const clientURL_1 = __importDefault(require("../config/clientURL"));
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
const checkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.originalUrl);
    const { products, delivery } = req.body;
    function getOrderedProduct(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield Products_1.default.findOne({ _id: item.id }).lean();
            const obj = {
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: product.name,
                        images: [product.prevImg],
                    },
                    unit_amount: product.special_offer.mode
                        ? (product.price - product.special_offer.price) * 100
                        : product.price * 100,
                },
                quantity: item.quantity,
            };
            return obj;
        });
    }
    function getOrderDelivery(name) {
        switch (name) {
            case 'deliveryMan':
                return 'shr_1M0mW8AgydS1xEfNY2LJgTeD';
            case 'atTheSalon':
                return 'shr_1M0mXUAgydS1xEfNBqx4xLbh';
            case 'locker':
                return 'shr_1M0Q7FAgydS1xEfNqMO8a55S';
            default:
                break;
        }
    }
    const orderedProducts = [];
    for (let i = 0; i < products.length; i++) {
        orderedProducts.push(yield getOrderedProduct(products[i]));
    }
    try {
        const session = yield stripe.checkout.sessions.create({
            locale: 'pl',
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_options: [{ shipping_rate: getOrderDelivery(delivery) }],
            line_items: orderedProducts,
            success_url: `${clientURL_1.default}/basket?success=true`,
            cancel_url: `${clientURL_1.default}/basket`,
        });
        res.json({ url: session.url });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.checkout = checkout;
