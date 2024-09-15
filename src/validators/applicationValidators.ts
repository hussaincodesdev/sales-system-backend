import { body, param, ValidationChain } from 'express-validator';

export const createApplicationValidator: ValidationChain[] = [
    body('first_name').isString().withMessage('First Name must be a string'),
    body('last_name').isString().withMessage('Last Name must be a string'),
    body('mobile').isString().withMessage('Invalid mobile number'),
    body('cpr').isString().withMessage('Invalid CPR number'),
];