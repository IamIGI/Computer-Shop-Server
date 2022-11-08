const { logEvents } = require('./logEvents');

const errorHandler = (err, req, res) => {
    logEvents(`${err.name}: ${err.message}`, `errLog.Log`);
    console.error(err.stack);
    res.status(500).send(err.message);
};

const apiErrorHandler = (req, res, err) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.originalUrl}\t ${err}`, `errApiLog.Log`);
    console.log(`Status: 500 \t ${req.originalUrl}\t ${err}`);
    return res.status(500).json({ message: err.message });
};

module.exports = { errorHandler, apiErrorHandler };
