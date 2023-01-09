import mongoose from 'mongoose';

export interface UserAccountComments {
    _id: string;
    productId: string;
    comment: {
        _id?: string;
        userId: string;
        userName: string;
        date: string;
        confirmed: boolean;
        likes: {
            up: number;
            down: number;
        };
        content: {
            rating: number;
            description: string;
        };
        image?: {
            added: boolean;
            images: string[];
        };
        usersWhoLiked?: [{ userId: string; likeUp: boolean }];
        length?: number;
    }[];
}

export interface CommentSchema {
    _id?: string;
    userId: string;
    userName: string;
    date: string;
    confirmed: boolean;
    likes?: {
        up: number;
        down: number;
    };
    content: {
        rating: number;
        description: string;
    };
    image?: {
        added: boolean;
        images: string[];
    };
    usersWhoLiked?: [{ userId: string; likeUp: boolean }];
    length?: number;
}

export interface CommentInput {
    productId: string;
    comments: CommentSchema[];
}

export interface CommentDocument extends CommentInput, mongoose.Document {}

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    productId: String,
    comments: [
        {
            userId: String,
            userName: String,
            date: String,
            confirmed: Boolean,
            likes: {
                up: {
                    type: Number,
                    default: 0,
                },
                down: {
                    type: Number,
                    default: 0,
                },
            },
            content: {
                rating: Number,
                description: String,
            },
            image: {
                added: Boolean,
                images: [
                    {
                        type: String,
                    },
                ],
            },
            usersWhoLiked: [{ userId: String, likeUp: Boolean }],
        },
    ],
});

const CommentModel = mongoose.model<CommentDocument>('comments', commentSchema);

export default CommentModel;
