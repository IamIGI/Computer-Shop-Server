import allowedOrigins from '../config/allowedOrigins';

const corsOptions = {
    // @ts-ignore - to ignore typescrip warrnings
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            //remove '!origin' after development
            callback(null, true); //send true when origin url in the whitelist
        } else {
            callback(new Error('not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};

export default corsOptions;
