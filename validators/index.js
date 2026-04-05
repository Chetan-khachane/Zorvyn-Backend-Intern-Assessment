import { application } from "express";
import {body} from "express-validator";

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



export  {
    userLoginValidator,
    userRegisterValidator,
    adminEmailValidator
}