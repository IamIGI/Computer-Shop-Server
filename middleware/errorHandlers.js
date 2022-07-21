const { logEvents } = require('./logEvents');

const errorHandler = (err, req, res) => {
    logEvents(`${err.name}: ${err.message}`, `errLog.txt`);
    console.error(err.stack);
    res.status(500).send(err.message);
};

const apiErrorHandler = (req, res, err) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.originalUrl}\t ${err}`, `errApiLog.txt`);
    console.log(`Status: 500 \t ${req.originalUrl}\t ${err}`);
    res.status(500).send(err.message);
    return;
};

module.exports = { errorHandler, apiErrorHandler };
