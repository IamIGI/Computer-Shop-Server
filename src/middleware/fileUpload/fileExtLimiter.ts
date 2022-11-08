import * as path from 'path';

const fileExtLimiter = (allowedExtArray) => {
    return (req, res, next) => {
        const files = req.files;
        if (Boolean(files)) {
            const fileExtensions = [];
            Object.keys(files).forEach((key) => {
                fileExtensions.push(path.extname(files[key].name.toLowerCase()));
            });

            //Are the file extensions allowed?
            const allowed = fileExtensions.every((ext) => allowedExtArray.includes(ext));

            if (!allowed) {
                const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(
                    ',',
                    ', '
                );

                return res.status(200).json({ status: 'error', message, code: 003 });
            }
        }

        next();
    };
};

module.exports = fileExtLimiter;
