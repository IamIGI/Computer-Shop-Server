import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '.env') });

const CLIENT_URL = process.env.DEPLOYMENT! === 'dev' ? 'http://localhost:3000' : 'https://hotshoot.tk';
export default CLIENT_URL;
