import jwt from 'jsonwebtoken';
import {Request} from 'express';

export const getUserIdFromToken = (req: Request): number | null => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        return decoded.id;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};