const Users = require('../model/Users');
const Products = require('../model/Products');
const Orders = require('../model/Orders');
const ForbiddenWords = require('../model/ForbiddenWords');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const addComment = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const doc = req.body;
    let confirmed = false;
    let userName = req.body.userName;
    let userId = req.body.userId;

    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    let userComment = doc.content.description.toLowerCase();
    forbiddenWords.map((word) => {
        if (userComment.includes(word)) {
            return res.status(403).json({ message: 'Given content contains vulgar and offensive content' });
        }
    });

    //Check if it is a logged user comment
    if (Boolean(doc.userId)) {
        //Check if someone trying to sneak up with fake userId
        foundUser = await Users.findOne({ _id: doc.userId }).exec();
        if (foundUser) {
            userName = foundUser.firstName;
            //Check if user bought this product
            const userOrders_Id = foundUser.userOrders;
            const userOrders_Content = await Orders.find({ _id: { $in: userOrders_Id } });
            for (let i = 0; i < userOrders_Content.length; i++) {
                if (userOrders_Content[i].products) {
                    for (let j = 0; j < userOrders_Content[i].products.length; j++) {
                        if (doc.productId == userOrders_Content[i].products[j]._id) {
                            confirmed = true;
                            break;
                        }
                    }
                }
                if (confirmed) break;
            }
        } else {
            console.log('Anonymous user');
            userId = '';
        }
    }

    const newComment = new Comments({
        userId,
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
};

module.exports = {
    addComment,
};
