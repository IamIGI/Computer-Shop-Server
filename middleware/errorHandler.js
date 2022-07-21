const { logEvents } = require('./logEvents');

const errorHandler = (err, req, res) => {
    logEvents(`${err.name}: ${err.message}`, `errLog.txt`);
    console.error(err.stack);
    res.status(500).send(err.message);
    console.log(err);
};

module.exports = errorHandler;
