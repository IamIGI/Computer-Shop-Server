const User = require('../model/Users');
const bcrypt = require('bcrypt');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const handleLogin = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const { email, hashedPassword } = req.body;

    if (!email || !hashedPassword) return res.status(400).json({ message: 'Username and password are required.' });

    const foundAccount = await User.findOne({ email }).exec();
    if (!foundAccount) return res.status(401).json({ message: `No account with given email` });

    const match = await bcrypt.compare(hashedPassword, foundAccount.hashedPassword);
    if (match) {
        try {
            const result = await foundAccount.save();
            console.log(result);
            res.status(200).json({ message: 'Log in successfully' });
        } catch (err) {
            apiErrorHandler(req, res, err);
        }
    }

    // User.findOne({
    //     email: email,
    //     hashedPassword: hashedPassword
    // },function(err, msg){
    //     if (msg) {
    //         console.log(`Zalogowano ${email}`);
    //         res.send({login: 100})
    //     }else{
    //         console.log('Nie pasuje do danego uzytkownika');
    //         res.send('Nie pasuje do zadnego uzytkownika')
    //     }
    // })
};

module.exports = {
    handleLogin,
};
