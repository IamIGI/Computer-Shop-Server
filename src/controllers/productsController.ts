import ProductModel, { ProductDocument } from '../model/Products';
import CommentModel from '../model/Comments';
import { Request, Response } from 'express';
import { apiErrorHandler } from '../middleware/errorHandlers';
import productFilters from '../middleware/filters/productFilters';
import commentsFilters from '../middleware/filters/commentsFilters';
import productPDF from '../middleware/pdfCreator/productDetails';

const getAllProducts = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const {
        searchTerm,
        filters: { producers, processors, ram, disk, discounts },
        sortBy,
    } = req.body;
    try {
        let products = await ProductModel.find({}).lean();
        //check if there is discount product
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            if (product.special_offer.mode) {
                product.price = product.price - product.special_offer.price;
            }
        }

        let filteredProducts = productFilters.filterRAM(products, ram);
        filteredProducts = productFilters.filterDiscounts(filteredProducts, discounts);
        filteredProducts = productFilters.filterDisk(filteredProducts, disk);
        filteredProducts = productFilters.filterProducers(filteredProducts, producers);
        filteredProducts = productFilters.filterProcessors(filteredProducts, processors);

        if (sortBy !== 'none') {
            if (sortBy === 'popular' || sortBy === 'rating') {
                const comments = await CommentModel.find({}).exec();
                if (sortBy === 'popular')
                    filteredProducts = productFilters.sortProductsByPopularity(filteredProducts, comments);
                if (sortBy === 'rating')
                    filteredProducts = await productFilters.sortProductsByRating(filteredProducts, comments);
            } else {
                filteredProducts = productFilters.sortProductsByPrice(filteredProducts, sortBy); //price, -price
            }
        }

        //SearchBar
        if (searchTerm !== '') {
            filteredProducts = filteredProducts.filter((product) => {
                return product.name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        //get averageScore and numberOfOpinions of filtered products
        for (let i = 0; i < filteredProducts.length; i++) {
            let productId = filteredProducts[i]._id;
            let averageScore = await commentsFilters.getAverageScore(productId);
            let productComments = await CommentModel.findOne({ productId }).exec();
            if (productComments) {
                filteredProducts[i].averageScore = averageScore.averageScore_View!;
                filteredProducts[i].averageStars = averageScore.averageScore_Stars!;
                filteredProducts[i].numberOfOpinions = productComments.comments.length;
            } else {
                filteredProducts[i].averageScore = 0;
                filteredProducts[i].averageStars = 0;
                filteredProducts[i].numberOfOpinions = 0;
            }
        }

        res.status(200).send(filteredProducts);
    } catch (err: any) {
        console.log(err);
        apiErrorHandler(req, res, err); //send products as a response
    }
};

const getProduct = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    const productCode = req.params.code;
    // let product: Record<string, any> = {};
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
    } catch (err: any) {
        apiErrorHandler(req, res, err);
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
    } catch (err: any) {
        apiErrorHandler(req, res, err);
    }
};

export default { getAllProducts, getProduct, getProductPDF };
