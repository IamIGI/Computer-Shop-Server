import * as path from 'path';
require('dotenv').config({ path: path.join(__dirname, '.env') });
import * as express from 'express';
const app = express();

const CLIENT_URL = app.get('env') === 'development' ? 'http://localhost:3000' : 'https://hotshoot.tk';

module.exports = CLIENT_URL;
