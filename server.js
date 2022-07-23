const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
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
// app.use(express.static(path.join(__dirname, '/public')));

//CORS configuration
app.use(cors(corsOptions));

//routes
app.use('/products', require('./routes/api/products'));
app.use('/register', require('./routes/api/register'));
app.use('/user', require('./routes/api/user'));
app.use('/order', require('./routes/api/order'));
app.use('/auth', require('./routes/api/auth'));

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
