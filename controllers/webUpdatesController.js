const WebUpdates = require('../model/WebUpdates');
const { format } = require('date-fns');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const webUpdatedPDF = require('../middleware/pdfCreator/webUpdates');

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

const getPDF = async (req, res, next) => {
    console.log(`${req.originalUrl}`);

    try {
        const response = await WebUpdates.find({}).lean();
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=UpdatesLogs.pdf`,
        });
        webUpdatedPDF.buildPDF(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            response
        );
        console.log('Send update list (PDF) successfully');
    } catch (err) {
        apiErrorHandler(req, res, err); //send products as a response
    }
};

module.exports = {
    addNewUpdate,
    getAllUpdates,
    getPDF,
};
