import ArticleModel from '../model/Articles';
import { apiErrorHandler } from '../middleware/errorHandlers';
import { Request, Response } from 'express';
import articleServices from '../services/article.services';
import mongoose from 'mongoose';

const getAllArticles = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const type = req.params.type;

    try {
        const articles = await articleServices.filterArticles(type);

        return res.status(200).json(articles);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getArticlesForHomePage = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const numberOfArticlesToReturn: number = 3;

    try {
        const articles = await articleServices.returnNumberOfArticles(numberOfArticlesToReturn);
        return res.status(200).json(articles);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

const getArticle = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id))
        return res.status(400).json({ err: 'bad id', message: 'given Id is not mongoDB id type' });

    try {
        const article = await ArticleModel.findOne({ _id }).exec();
        return res.status(200).json(article);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { getAllArticles, getArticlesForHomePage, getArticle };
