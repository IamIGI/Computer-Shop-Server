const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const { errorHandler } = require('./middleware/errorHandlers');
const connectDB = require('./config/dbConn');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const { default: mongoose } = require('mongoose');

const PORT = process.env.PORT || 5000;

//Connect to MongoDB
connectDB();

//LOG TRAFFIC - on top to log all traffic
app.use(logger);

//Handle options credentials check -  BEFORE CORS!!!
// and fetch cookies credentials requirement
app.use(credentials);

//CORS configuration
app.use(cors(corsOptions));

//server config
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public'))); //for images,css from server side

// Cookies handler
app.use(cookieParser());

//public Routes
app.use('/products', require('./routes/api/products'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/comments', require('./routes/api/comments'));
app.use('/hotshoot', require('./routes/api/hotshootpromotion'));
app.use('/content', require('./routes/api/content'));
app.use('/order', require('./routes/api/order'));
app.use('/webupdates', require('./routes/api/updatelog'));
app.use('/contact', require('./routes/api/contact'));

//protected Routes
app.use(verifyJWT);
app.use('/user', require('./routes/api/user'));
app.use('/admin', require('./routes/api/admin'));

// handle UNKNOWN URL REQUESTS
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('json')) {
        res.json({ error: '404: not found' });
    } else if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else {
        res.type('txt').send('404: not found');
    }
});

//LOG ERRORS
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
