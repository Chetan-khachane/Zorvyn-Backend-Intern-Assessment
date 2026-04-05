import {body} from "express-validator";

const userRegisterValidator = () =>{
    return [
        body("email")
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

export  {
    userLoginValidator,
    userRegisterValidator
}