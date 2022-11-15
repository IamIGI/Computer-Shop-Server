import mongoose from 'mongoose';

export interface ForbiddenWordsInput {
    forbiddenWords: string[];
}

export interface ForbiddenWordsDocument extends ForbiddenWordsInput, mongoose.Document {}

// Schema
const Schema = mongoose.Schema;

const forbiddenWordsSchema = new Schema({
    forbiddenWords: Array,
});
export default mongoose.model<ForbiddenWordsDocument>('forbiddenwords', forbiddenWordsSchema);
