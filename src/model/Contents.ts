import mongoose from 'mongoose';

export interface ContentInput {
    pageName: string;
    description: object[];
    lastUpdate: string;
}

export interface ContentDocument extends ContentInput, mongoose.Document {}

const Schema = mongoose.Schema;

// Schema
const contents = new Schema({
    pageName: String,
    description: Array,
    lastUpdate: String,
});
export default mongoose.model<ContentDocument>('Contents', contents);
