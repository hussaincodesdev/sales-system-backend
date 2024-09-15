import winston, { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = format;

// Define your custom log levels and colors
interface CustomLevels {
    levels: Record<string, number>;
    colors: Record<string, string>;
}

const customLevels: CustomLevels = {
    levels: {
        critical: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4,
        verbose: 5,
    },
    colors: {
        critical: 'bold redBG white',
        error: 'red',
        warning: 'yellow',
        info: 'green',
        debug: 'cyan',
        verbose: 'grey',
    },
};

// Add custom colors to winston
winston.addColors(customLevels.colors);

// Define your custom format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create the logger instance
const logger: Logger = createLogger({
    levels: customLevels.levels,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),  // Colorize only for console output
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        }),
        new transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

export default logger;