import { Request, Response, NextFunction } from 'express';

export const responseFormatter = (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (data: any): Response {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        const formattedResponse = {
            msg: isSuccess ? 'success' : 'error',
            response: {
                data: Array.isArray(data) ? data : [data]
            },
            result: isSuccess ? 0 : 1
        };
        return originalJson.call(this, formattedResponse);
    };

    next();
};