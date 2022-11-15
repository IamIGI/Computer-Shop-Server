import dotenv from 'dotenv';
//remove ?
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN_SECRET;

const config = {
    tokens: {
        accessToken,
    },
};

export default config;
