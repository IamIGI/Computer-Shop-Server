const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        console.log(req.roles);
        if (!req?.roles) return res.status(401).json({ message: 'VerifyRoles: no roles are specified in the request' });
        const rolesArray = [...allowedRoles];
        console.log('Allowed Roles: ' + rolesArray + '\t Account role:' + req.roles);
        const result = req.roles.map((role) => rolesArray.includes(role)).find((val) => val === true);
        if (!result) {
            return res.status(401).json({
                message: `VerifyRoles: Account roles do not have enough credentials for that request`,
                Credentials_level: `Needed credentials on level ${rolesArray}`,
            });
        }
        console.log(`User have right role: ${result}`);

        next();
    };
};

module.exports = verifyRoles;
