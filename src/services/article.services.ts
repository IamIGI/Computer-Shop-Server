import ArticleModel, { ArticlesDocument } from '../model/Articles';

/** filter articles by given type: none / news / guide */
async function filterArticles(articleType: string): Promise<ArticlesDocument> {
    if (articleType === 'none') {
        return await ArticleModel.find({}).lean();
    } else {
        return await ArticleModel.find({ type: articleType }).lean();
    }
}

export default { filterArticles };
