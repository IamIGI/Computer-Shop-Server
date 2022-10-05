const Contact = require('../model/Contact');
const ForbiddenWords = require('../model/ForbiddenWords');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');
// const path = require('path');

const sendMessage = async (req, res) => {
    console.log(`${req.originalUrl}`);
    //category: 0 - error, 1 - cooperation
    // console.log(req);
    // const files = req.files;
    const { name, email, message, category } = req.body;
    const date = format(new Date(), 'yyyy.MM.dd-HH:mm:ss');
    console.log(name);

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
        //save text data of the message
        await newMessage.save();
        //save files data of the message
        // console.log(path.join(__dirname, '../files/images/contactAuthorMessages'));
        // Object.keys(files).forEach((key) => {
        //     const filepath = path.join(__dirname, '../files/images/contactAuthorMessages', files[key].name);
        //     files[key].mv(filepath, (err) => {
        //         if (err) return res.status(400).json({ status: 'error', message: err });
        //     });
        // });

        // return res.status(200).json({ status: 'success', message: Object.keys(files).toString() });
        console.log({ status: 'success', message: 'new message to author', name, date, code: 000 });
        res.status(200).json({ status: 'success', message: 'new message to author', name, date, code: 000 });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    sendMessage,
};
