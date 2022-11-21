"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// validate request object against that schema
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (err) {
        return res.status(400).send(err.errors);
    }
};
exports.default = validate;
