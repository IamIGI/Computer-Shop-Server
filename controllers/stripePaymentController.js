const { apiErrorHandler } = require('../middleware/errorHandlers');
const Products = require('../model/Products');
const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);
const CLIENT_URL = require('../config/clientURL');

const checkout = async (req, res) => {
    console.log(req.originalUrl);
    const {
        stripeObj: { products, delivery },
    } = req.body;

    async function getOrderedProduct(item) {
        const product = await Products.findOne({ _id: item.id }).lean();
        const obj = {
            price_data: {
                currency: 'pln',
                product_data: {
                    name: product.name,
                    images: [product.prevImg],
                },
                unit_amount: product.price * 100,
            },
            quantity: item.quantity,
        };
        return obj;
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
        orderedProducts.push(await getOrderedProduct(products[i]));
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_options: [{ shipping_rate: getOrderDelivery(delivery) }],
            line_items: orderedProducts,
            success_url: `${CLIENT_URL}/basket?success=true`,
            cancel_url: `${CLIENT_URL}/basket`,
        });
        res.json({ url: session.url });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    checkout,
};
