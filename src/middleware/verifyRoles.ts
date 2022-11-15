import { Request, Response, NextFunction } from 'express';
import { CustomRequestJWT } from './verifyJWT';

const verifyRoles = (...allowedRoles: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!(req as CustomRequestJWT).roles)
            return res.status(401).json({ message: 'VerifyRoles: no roles are specified in the request' });
        const rolesArray = [...allowedRoles];
        console.log('Allowed Roles: ' + rolesArray + '\t Account role:' + (req as CustomRequestJWT).roles);
        const result = ((req as CustomRequestJWT).roles as number[])
            .map((role: number) => rolesArray.includes(role))
            .find((val: boolean) => val === true);
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

export default verifyRoles;
