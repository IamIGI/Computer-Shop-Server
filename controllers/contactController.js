const Contact = require('../model/Contact');
const ForbiddenWords = require('../model/ForbiddenWords');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const sendMessage = async (req, res) => {
    console.log(`${req.originalUrl}`);
    //category: 0 - error, 1 - cooperation
    const { name, email, message, category } = req.body;
    const date = format(new Date(), 'yyyy.MM.dd-HH:mm:ss');

    //validate message
    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (name.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given name contains vulgar and offensive content', code: 002 });
        }
    }
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (message.includes(forbiddenWords[i])) {
            return res.status(200).json({ message: 'Given content contains vulgar and offensive content', code: 001 });
        }
    }

    //save message
    const newMessage = new Contact({
        name,
        email,
        date,
        message,
        category,
    });
    try {
        await newMessage.save();
        res.status(200).json({ code: 200, message: 'New contact message', name, date, code: 000 });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    sendMessage,
};
