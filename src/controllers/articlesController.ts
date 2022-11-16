import ArticleModel from '../model/Articles';
import { apiErrorHandler } from '../middleware/errorHandlers';
import { Request, Response } from 'express';

async function DBgetArticles(articleType: string) {
    if (articleType === 'none') {
        console.log('here');
        const response = await ArticleModel.find({}).lean();
        console.log(response);
        return response;
    } else {
        return await ArticleModel.find({ type: articleType }).lean();
    }
}

const getAllArticles = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { type } = req.body;

    try {
        const articles = await DBgetArticles(type);
        console.log('ARTYKLY: ', articles);
        return res.status(200).json(articles);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

export default { getAllArticles };