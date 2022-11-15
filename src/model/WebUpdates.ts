import mongoose from 'mongoose';

export interface WebUpdatesInput {
    version: string;
    date: string;
    changes: {
        added: string[];
        fixes: string[];
    };
}

export interface WebUpdatesDocument extends WebUpdatesInput, mongoose.Document {}

const Schema = mongoose.Schema;

const webUpdatesSchema = new Schema({
    version: String,
    date: String,
    changes: {
        added: Array,
        fixes: Array,
    },
});

export default mongoose.model<WebUpdatesDocument>('WebUpdates', webUpdatesSchema);
