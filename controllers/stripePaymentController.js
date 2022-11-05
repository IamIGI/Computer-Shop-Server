const { apiErrorHandler } = require('../middleware/errorHandlers');
const Products = require('../model/Products');
const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

const checkout = async (req, res) => {
    console.log(req.originalUrl);
    const { products, delivery } = req.body;
    console.log(products);

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

    let orderedProducts = [];
    for (let i = 0; i < products.length; i++) {
        console.log(products[i].id);
        orderedProducts.push(await getOrderedProduct(products[i]));
    }

    console.log(orderedProducts);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            shipping_options: [{ shipping_rate: getOrderDelivery(delivery) }],
            line_items: orderedProducts,
            success_url: `${process.env.CLIENT_URL}/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
        });
        res.json({ url: session.url });
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    checkout,
};
