const Users = require('../model/Users');
const Products = require('../model/Products');
const ForbiddenWords = require('../model/ForbiddenWords');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const addComment = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    let confirmed = false;
    let userName = req.body.userName;

    //Check if it is a logged user comment
    Boolean(doc.userId) && (confirmed = true);
    confirmed && (userName = (await Users.findOne({ _id: doc.userId }).exec()).firstName);

    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    let userComment = doc.content.description.toLowerCase();
    let forbiddenWordsCheck = false;
    for (var i = 0; i < forbiddenWords.length; i++) {
        if (userComment.includes(forbiddenWords[i])) {
            forbiddenWordsCheck = true;
            break;
        }
    }

    if (forbiddenWordsCheck) {
        res.status(403).json({ message: 'Given content contains vulgar and offensive content' });
        console.log({ message: 'Given content contains vulgar and offensive content' });
    } else {
        const newComment = new Comments({
            userId: doc.userId,
            productId: doc.productId,
            userName,
            date: format(new Date(), 'yyyy.MM.dd'),
            confirmed,
            likes: {
                up: doc.likes.up,
                down: doc.likes.down,
            },
            content: {
                rating: doc.content.rating,
                description: doc.content.description,
            },
        });

        newComment.save(async (err, result) => {
            if (!err) {
                console.log(`Saved comment for product ${doc.productId}`);
                if (confirmed) {
                    await Users.updateOne(
                        { _id: doc.userId },
                        {
                            $push: { userComments: result._id },
                        }
                    );
                }

                res.status(201).json({ message: 'Successfully save a new comment', CommentId: `${result._id}` });
                console.log({ message: 'Successfully save a new comment', CommentId: `${result._id}` });
                return result._id;
            } else {
                apiErrorHandler(req, res, err);
            }
        });
    }
};

module.exports = {
    addComment,
};
