const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const app = express();

const CLIENT_URL = app.get('env') === 'development' ? 'http://localhost:3000' : 'https://hotshoot.tk';

module.exports = CLIENT_URL;
