"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = __importStar(require("express"));
const app = express();
const cors = __importStar(require("cors"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const logEvents_1 = require("./middleware/logEvents");
const errorHandlers_1 = require("./middleware/errorHandlers");
const dbConn_1 = __importDefault(require("./config/dbConn"));
const verifyJWT_1 = __importDefault(require("./middleware/verifyJWT"));
const cookieParser = __importStar(require("cookie-parser"));
const credentials_1 = __importDefault(require("./middleware/credentials"));
const mongoose = __importStar(require("mongoose"));
const PORT = process.env.PORT || 5000;
//Connect to MongoDB
(0, dbConn_1.default)();
//LOG TRAFFIC - on top to log all traffic
app.use(logEvents_1.logger);
//Handle options credentials check -  BEFORE CORS!!!
// and fetch cookies credentials requirement
app.use(credentials_1.default);
//CORS configuration
app.use(cors(corsOptions_1.default));
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
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }
    else {
        res.type('txt').send('404: not found');
    }
});
//LOG ERRORS
app.use(errorHandlers_1.errorHandler);
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
