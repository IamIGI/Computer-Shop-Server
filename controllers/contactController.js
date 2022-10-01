const Contact = require('../model/Contact');
const ForbiddenWords = require('../model/ForbiddenWords');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const sendMessage = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { name, email, message } = req.body;
    const date = format(new Date(), 'yyyy.MM.dd-HH:mm:ss');

    //validate message
    //Check for vulgar and offensive content
    const forbiddenWords = (await ForbiddenWords.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (message.includes(forbiddenWords[i])) {
            return res.status(403).json({ message: 'Given content contains vulgar and offensive content', code: 001 });
        }
    }
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (name.includes(forbiddenWords[i])) {
            return res.status(403).json({ message: 'Given content contains vulgar and offensive content', code: 001 });
        }
    }

    //save message
    const newMessage = new Contact({
        name,
        email,
        date,
        message,
    });
    try {
        await newMessage.save();
        res.status(200).json({ code: 200, message: 'New contact message', name, date });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    sendMessage,
};
