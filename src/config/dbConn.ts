const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useUnifiedTopology: true, //use new Server Engine
            useNewUrlParser: true, //previous UrlParser will be removed, so you have to make that flag
        });
    } catch (err) {
        console.log('DB no connection');
        console.error(err);
    }
};

module.exports = connectDB;
