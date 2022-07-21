const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });

        console.log('DB Connected');
    } catch (err) {
        console.log('DB no connection');
        console.error(err);
    }
};

module.exports = connectDB;
