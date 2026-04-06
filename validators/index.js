import { application } from "express";
import {body, query} from "express-validator";

const userRegisterValidator = () =>{
    return [
        body("userEmail").optional()
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
        ,
        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({min : 6})
        .withMessage("Min 6 characters")
        ,
        body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
    ]
}

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

// Assuming  enterpise application,below i use "mycompany.com" for security of admin's account 
// and other roles can only be registered by verified admin account

const adminEmailValidator = () => { 
  return [
    body("adminEmail")
    .trim()
    .notEmpty()
    .withMessage("Email is Required")
    .isEmail()
    .withMessage("Invalid Email")
    .contains("mycompany.com")
    .withMessage("Access Forbidden,Check Email"),
  ]
}

const transactionValidator = () =>{
  return [
    body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
    body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
    body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['food', 'entertainment','health','travel','clothing','salary','rental_income','business','other'])
    .withMessage('Category must be either (food, entertainment,health,travel,clothing,salary,rental_income,business,other)'),
    body('note')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Note cannot exceed 200 characters'),
  ]
}

const viewTransactionValidtor = () => {
  return [
    query("type")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Transaction Type cannot be empty")
    .isIn(['income','expense']),

     query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['food', 'entertainment','health','travel','clothing','salary','rental_income','business','other'])
    .withMessage('Category must be either (food, entertainment,health,travel,clothing,salary,rental_income,business,other)'),

 query("from")
  .optional()
  .isISO8601()
  .withMessage("From must be a valid date"),

query("to")
  .optional()
  .isISO8601()
  .withMessage("To must be a valid date")
  .custom((toDate, { req }) => {
    const fromDate = req.query.from;

    // If 'from' is missing, we can't compare, so we let it pass
    if (!fromDate) return true;

    // Return false if 'to' is earlier than 'from'
    // This triggers the .withMessage() below
    return new Date(toDate) >= new Date(fromDate);
  })
  .withMessage("To date cannot be earlier than From date"),

  query("userId")
  .optional()
  .trim()
  .notEmpty()
  .withMessage("user id not be empty")

  ]
}


const userTransactionTrendValidator = () =>{
  return [
    query("period")
    .optional()
    .isIn(["weekly","monthly"])
    .withMessage("period must be in (weekly,monthly) ")
  ]
}


const analyticsValidator = () => {
  return [
    query("period")
    .optional()
    .trim()
    .isIn(["weekly","monthly","yearly"])
    .withMessage("period must be in [(weekly,monthly,yearly) only")
  ]
}

export  {
    userLoginValidator,
    userRegisterValidator,
    adminEmailValidator,
    transactionValidator,
    viewTransactionValidtor,
    userTransactionTrendValidator,
    analyticsValidator
}