import ProductModel from '../model/Products';
import CommentModel from '../model/Comments';
import { Request, Response } from 'express';
import { apiErrorHandler } from '../middleware/errorHandlers';
import productPDF from '../middleware/pdfCreator/productDetails';
import productServices from '../services/product.services';

const getAllProducts = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const {
        searchTerm,
        filters: { producers, processors, ram, disk, discounts },
        sortBy,
    } = req.body;

    try {
        let response = await ProductModel.find({}).lean();

        let products = productServices.productsDiscount(response);

        products = productServices.filterProducts(products, ram, discounts, disk, producers, processors);

        products = await productServices.sortProducts(products, sortBy);

        products = productServices.searchProduct(products, searchTerm);

        products = await productServices.addCommentParamsToProductObject(products);

        res.status(200).send(products);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error); //send products as a response
    }
};

const getProduct = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    const productCode = req.params.code;
    try {
        let product = await ProductModel.findOne({ _id: productCode }).lean();
        if (product === null) return res.status(404).send('No product match given code');

        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }
        const comments = await CommentModel.findOne({ productId: productCode }).exec();

        if (!comments) {
            product.numberOfOpinions = 0;
        } else {
            product.numberOfOpinions = comments.comments.length;
        }

        console.log({ message: 'return product data', productId: productCode });
        res.status(200).send(product);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getProductPDF = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    const productCode = req.params.code;
    try {
        let product = await ProductModel.findOne({ _id: productCode }).lean();

        if (product === null) return res.status(404).send('No product match given code');

        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }

        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=${product.name}.pdf`,
        });

        productPDF.buildPDF(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            product
        );

        console.log({ msg: 'Send product (PDF) successfully', productId: product._id });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { getAllProducts, getProduct, getProductPDF };
