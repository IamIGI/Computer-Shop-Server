const WebUpdates = require('../model/WebUpdates');
const { format } = require('date-fns');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const addNewUpdate = async (req, res) => {
    console.log(`${req.originalUrl}`);

    const { version, changes } = req.body;

    const newUpdate = new WebUpdates({
        version,
        date: format(new Date(), 'yyyy.MM.dd'),
        changes,
    });

    try {
        const result = await newUpdate.save();
        console.log('Added new update register');
        return res.status(200).json({ message: 'Added new update register', date: format(new Date(), 'yyyy.MM.dd') });
    } catch (err) {
        console.log(result);
        apiErrorHandler(req, res, err);
    }
};

const getAllUpdates = async (req, res) => {
    console.log(`${req.originalUrl}`);

    try {
        const response = await WebUpdates.find({}).lean();
        console.log('List of updates returned successfully');
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err); //send products as a response
    }
};

module.exports = {
    addNewUpdate,
    getAllUpdates,
};
