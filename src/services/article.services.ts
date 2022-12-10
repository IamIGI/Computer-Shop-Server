import ArticleModel, { ArticlesDocument } from '../model/Articles';

/** filter articles by given type: none / news / guide */
async function filterArticles(articleType: string): Promise<ArticlesDocument> {
    if (articleType === 'none') {
        return await ArticleModel.find({}).sort({ $natural: -1 }).lean();
    } else {
        return await ArticleModel.find({ type: articleType }).sort({ $natural: -1 }).lean();
    }
}

/** return last n arguments sorted by date when they where added to mongoDB collection */
async function returnNumberOfArticles(number: number): Promise<ArticlesDocument> {
    return await ArticleModel.find(
        {},
        {
            followedBy: {
                $slice: number,
            },
        }
    )
        .sort({ $natural: -1 })
        .limit(3)
        .lean();
}

export default { filterArticles, returnNumberOfArticles };
