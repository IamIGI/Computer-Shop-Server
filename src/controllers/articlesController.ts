import ArticleModel from '../model/Articles';
import { apiErrorHandler } from '../middleware/errorHandlers';
import { Request, Response } from 'express';
import articleServices from '../services/article.services';

const getAllArticles = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const type = req.params.type;

    try {
        const articles = await articleServices.filterArticles(type);

        articles.reverse();

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
