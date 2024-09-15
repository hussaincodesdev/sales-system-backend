import dotenv from 'dotenv';
import express, {NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from './logger';
import v1Routes from './routes/v1';
import {responseFormatter} from "./middleware/responseFormatter";


dotenv.config();

const app = express();

const startApp = async () => {
    const start = Date.now();

    logger.verbose('Starting Backend', Date.now() - start);
    logger.info(`Environment: ${process.env.NODE_ENV}`, Date.now() - start);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cors());
    app.use(express.json());
    app.use(responseFormatter);

    app.use((req: Request, res: Response, next: NextFunction) => {
        logger.info(`${req.method} ${req.url}`);
        next();
    });

    app.use('/api/v1', v1Routes);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(`Error: ${err.message}`);
        res.status(500).json('Something broke!');
    });

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
    });
};

startApp();

export default app;