const Contact = require('../model/Contact');
const ForbiddenWords = require('../model/ForbiddenWords');
const { apiErrorHandler } = require('../middleware/errorHandlers');
import * as dataFns from 'date-fns';
const { format } = dataFns;
import * as path from 'path';

const sendMessage = async (req, res) => {
    console.log(`${req.originalUrl}`);
    //category: 0 - error, 1 - cooperation
    const files = req.files;
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

    let added = false;
    let images = [];

    if (Boolean(files)) {
        added = true;
        Object.keys(files).forEach((key) => {
            // console.log(files[key].name);
            images.push(files[key].name);
        });
    }
    //save message
    const newMessage = new Contact({
        name,
        email,
        date,
        message,
        category,
        image: {
            added,
            images,
        },
    });

    try {
        // save text data of the message
        const response = await newMessage.save();
        // save files data of the message

        if (Boolean(files)) {
            Object.keys(files).forEach((key) => {
                const filepath = path.join(__dirname, `../files/contactAuthor/errors/${response._id}`, files[key].name);
                files[key].mv(filepath, (err) => {
                    if (err) return console.log({ status: 'error', message: err });
                    if (err) return res.status(400).json({ status: 'error', message: err });
                });
            });
        }

        console.log({ status: 'success', message: 'new message to author', date, code: 000 });
        res.status(200).json({ status: 'success', message: 'new message to author', date, code: 000 });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    sendMessage,
};
