import { apiErrorHandler } from '../middleware/errorHandlers';
// const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
import Stripe from 'stripe';
import CLIENT_URL from '../config/clientURL';
import { Request, Response } from 'express';
import { ProductDocument } from '../model/Products';
import ProductModel from '../model/Products';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);

interface basketItems {
    prevImg: string;
    _id: string;
    quantity: number;
    name: string;
    brand: string;
    price: number;
    isDiscount: boolean;
    priceBeforeDiscount: number;
}

const checkout = async (req: Request, res: Response) => {
    console.log(req.originalUrl);
    const { products, delivery } = req.body;

    async function getOrderedProduct(product: basketItems) {
        const obj = {
            price_data: {
                currency: 'pln',
                product_data: {
                    name: product.name,
                    images: [product.prevImg],
                },
                unit_amount: Number((product.price * 100).toFixed(2)),
            },
            quantity: product.quantity,
        };
        return obj;
    }

    function getOrderDelivery(name: string) {
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
        orderedProducts.push(await getOrderedProduct(products[i]));
    }

    try {
        // @ts-ignore
        const session = await stripe.checkout.sessions.create({
            locale: 'pl',
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_options: [{ shipping_rate: getOrderDelivery(delivery) }],
            line_items: orderedProducts,
            success_url: `${CLIENT_URL}/basket?success=true`,
            cancel_url: `${CLIENT_URL}/basket`,
        });
        res.json({ url: session.url });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { checkout };
