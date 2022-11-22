import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '.env') });
import express from 'express';
const app = express();

const CLIENT_URL = process.env.DEPLOYMENTY! === 'dev' ? 'http://localhost:3000' : 'https://hotshoot.tk';
export default CLIENT_URL;
