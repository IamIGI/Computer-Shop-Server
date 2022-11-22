import productFilters from '../middleware/filters/productFilters';
import { ProductDocument } from '../model/Products';
import CommentModel from '../model/Comments';
import commentsFilters from '../middleware/filters/commentsFilters';

/** add averageScore, averageStore, numberOfOpinions to product object */
async function addCommentParamsToProductObject(products: ProductDocument[]): Promise<ProductDocument[]> {
    try {
        for (let i = 0; i < products!.length; i++) {
            let productId = products[i]._id;
            let averageScore = await commentsFilters.getAverageScore(productId);
            let productComments = await CommentModel.findOne({ productId }).exec();
            if (productComments) {
                products[i].averageScore = averageScore.averageScore_View!;
                products[i].averageStars = averageScore.averageScore_Stars!;
                products[i].numberOfOpinions = productComments.comments.length;
            } else {
                products[i].averageScore = 0;
                products[i].averageStars = 0;
                products[i].numberOfOpinions = 0;
            }
        }

        return products;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/** search product by value user typed in searchbar */
function searchProduct(products: ProductDocument[], searchTerm: string): ProductDocument[] {
    if (searchTerm === '') return products;
    return products.filter((product) => {
        return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
}

/** check for product discounts in db / hotShoot system discounts */
function productsDiscount(products: ProductDocument[]): ProductDocument[] {
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }
    }
    return products;
}

/** filter products by ram, discounts, disk, producers, processors */
function filterProducts(
    products: ProductDocument[],
    ram: { min: number | string; max: number | string },
    discounts: boolean,
    disk: { min: number | string; max: number | string },
    producers: string[],
    processors: string[]
): ProductDocument[] {
    let filteredProducts = productFilters.filterRAM(products, ram);
    filteredProducts = productFilters.filterDiscounts(filteredProducts, discounts);
    filteredProducts = productFilters.filterDisk(filteredProducts, disk);
    filteredProducts = productFilters.filterProducers(filteredProducts, producers);
    filteredProducts = productFilters.filterProcessors(filteredProducts, processors);

    return filteredProducts;
}

/**Sort products by given key words: none, popular, rating, price , -price*/
async function sortProducts(products: ProductDocument[], sortBy: string): Promise<ProductDocument[]> {
    try {
        let sortedProducts = products;
        if (sortBy !== 'none') {
            if (sortBy === 'popular' || sortBy === 'rating') {
                const comments = await CommentModel.find({}).exec();
                if (sortBy === 'popular') sortedProducts = productFilters.sortProductsByPopularity(products, comments);
                if (sortBy === 'rating') sortedProducts = await productFilters.sortProductsByRating(products, comments);
            } else {
                sortedProducts = productFilters.sortProductsByPrice(products, sortBy); //price, -price
            }
        }

        return sortedProducts;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export default { addCommentParamsToProductObject, searchProduct, productsDiscount, filterProducts, sortProducts };
