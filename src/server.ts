import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '.env') });
import express, { Request, Response } from 'express';

import cors from 'cors';
import corsOptions from './config/corsOptions';
import { logger } from './middleware/logEvents';
import { errorHandler } from './middleware/errorHandlers';
import connectDB from './config/dbConn';
import verifyJWT from './middleware/verifyJWT';
import cookieParser from 'cookie-parser';
import credentials from './middleware/credentials';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

//Connect to MongoDB
connectDB();
const app = express();

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

app.use('/public', express.static(path.join(__dirname, '/public'))); //for images,css from server side

app.use('/comments', express.static(path.join(__dirname, '/files/comments')));

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
app.use('/webupdates', require('./routes/api/updatelog'));
app.use('/contact', require('./routes/api/contact'));

app.use('/order', require('./routes/api/order'));
app.use('/stripe', require('./routes/api/stripe'));

//protected Routes
app.use(verifyJWT);
app.use('/user', require('./routes/api/user'));
app.use('/admin', require('./routes/api/admin'));

// handle UNKNOWN URL REQUESTS
app.all('*', (req: Request, res: Response) => {
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
