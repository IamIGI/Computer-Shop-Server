const Contents = require('../model/Contents');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const getAboutPageData = async (req, res) => {
    console.log(`${req.originalUrl}`);
    try {
        const response = await Contents.findOne({ pageName: 'About' }).lean();
        console.log(response);
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    getAboutPageData,
};
