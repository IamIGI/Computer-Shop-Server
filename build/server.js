"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.join(__dirname, '.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const logEvents_1 = require("./middleware/logEvents");
const errorHandlers_1 = require("./middleware/errorHandlers");
const dbConn_1 = __importDefault(require("./config/dbConn"));
const verifyJWT_1 = __importDefault(require("./middleware/verifyJWT"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const credentials_1 = __importDefault(require("./middleware/credentials"));
const mongoose_1 = __importDefault(require("mongoose"));
const PORT = process.env.PORT || 5000;
//Connect to MongoDB
(0, dbConn_1.default)();
const app = (0, express_1.default)();
//LOG TRAFFIC - on top to log all traffic
app.use(logEvents_1.logger);
//Handle options credentials check -  BEFORE CORS!!!
// and fetch cookies credentials requirement
app.use(credentials_1.default);
//CORS configuration
app.use((0, cors_1.default)(corsOptions_1.default));
//server config
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '/public'))); //for images,css from server side
app.use('/comments', express_1.default.static(path_1.default.join(__dirname, '/files/comments')));
// Cookies handler
app.use((0, cookie_parser_1.default)());
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
app.use(verifyJWT_1.default);
app.use('/user', require('./routes/api/user'));
app.use('/admin', require('./routes/api/admin'));
// handle UNKNOWN URL REQUESTS
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('json')) {
        res.json({ error: '404: not found' });
    }
    else if (req.accepts('html')) {
        res.sendFile(path_1.default.join(__dirname, 'views', '404.html'));
    }
    else {
        res.type('txt').send('404: not found');
    }
});
//LOG ERRORS
app.use(errorHandlers_1.errorHandler);
mongoose_1.default.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
