import { body, param, ValidationChain } from 'express-validator';

export const createUserValidator: ValidationChain[] = [
    body('first_name').isString().withMessage('First Name must be a string'),
    body('last_name').isString().withMessage('Last Name must be a string'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('mobile').isString().withMessage('Invalid mobile number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['admin', 'sales_agent', 'sales_coach']).withMessage('Invalid role')
];

export const updateUserValidator: ValidationChain[] = [
    body('first_name').isString().withMessage('First Name must be a string'),
    body('last_name').isString().withMessage('Last Name must be a string'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('mobile').isString().withMessage('Invalid mobile number'),
];

export const loginUserValidator: ValidationChain[] = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const updateUserProfileValidator: ValidationChain[] = [
    body('first_name').isString().withMessage('First Name must be a string'),
    body('last_name').isString().withMessage('Last Name must be a string'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('mobile').isString().withMessage('Invalid mobile number'),
    body('bank_details.account_number').optional().isString().withMessage('Invalid account number'),
    body('bank_details.bank_name').optional().isString().withMessage('Invalid bank name'),
    body('bank_details.iban').optional().isString().withMessage('Invalid IBAN')
];