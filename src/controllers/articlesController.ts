import ArticleModel from '../model/Articles';
import { apiErrorHandler } from '../middleware/errorHandlers';
import { Request, Response } from 'express';

async function DBgetArticles(articleType: string) {
    if (articleType === 'none') {
        return await ArticleModel.find({}).lean();
    } else {
        return await ArticleModel.find({ type: articleType }).lean();
    }
}

const getAllArticles = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const type = req.params.type;

    try {
        const articles = await DBgetArticles(type);
        return res.status(200).json(articles);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getArticle = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const _id = req.params.id;
    try {
        const article = await ArticleModel.findOne({ _id }).exec();
        return res.status(200).json(article);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { getAllArticles, getArticle };
