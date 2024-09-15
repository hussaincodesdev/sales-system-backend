import { body, ValidationChain } from "express-validator";

export const createCommissionValidator: ValidationChain[] = [
  body("sales_agent_id")
    .isInt()
    .withMessage("Sales agent ID must be an integer"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("status")
    .isIn(["due", "paid"])
    .withMessage('Status must be either "due" or "paid"'),
];

export const updateCommissionValidator: ValidationChain[] = [
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("status")
    .optional()
    .isIn(["due", "paid"])
    .withMessage('Status must be either "due" or "paid"'),
];
