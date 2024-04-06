import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: string;
    email: string;
    username: string;
}

// Extending the Request type by adding a custom user property as express does not have user property in the Request
export interface RequestWithUser extends Request {
    user?: TokenPayload;
}

export const verifyToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
        if(!decoded){
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
