import mongoose from 'mongoose';

export interface ArticlesContent {
    p: string;
}

export interface ArticlesDescription {
    image?: string;
    title: string;
    content: ArticlesContent[];
}

export interface ArticlesInput {
    type: string;
    createdAt: string;
    updatedAt: string;
    prevImage: string;
    title: string;
    prevDescription: string;
    description: ArticlesDescription;
}

export interface ArticlesDocument extends ArticlesInput, mongoose.Document {}

const Schema = mongoose.Schema;

//Schema

const articleschema = new Schema({
    type: String,
    createdAt: String,
    updatedAt: String,
    prevImage: String,
    title: String,
    prevDescription: String,
});

const ArticleModel = mongoose.model<ArticlesDocument>('Articles', articleschema);

export default ArticleModel;
