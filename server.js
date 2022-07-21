const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const { errorHandler } = require('./middleware/errorHandlers');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 5000;

//Connect to MongoDB
connectDB();

//LOG TRAFFIC - on top to log all traffic

app.use(logger);

//server config
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

//CORS configuration
//approved url
const whiteList = [
    'http://127.0.0.1:5000',
    'http://localhost:3500',
    'http://localhost:3000', //working with react :)
];
const corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            //remove '!origin' after development
            callback(null, true); //send true when origin url in the whitelist
        } else {
            callback(new Error('not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// app.get('/', (req, res) => {
//     res.send('Hello world');
// });

//routes
app.use('/product', require('./routes/api/products'));

//handle UNKNOWN URL REQUESTS
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404: not found' });
    } else {
        res.type('txt').send('404: not found');
    }
});

//LOG ERRORS
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
