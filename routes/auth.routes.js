import { Router } from "express";
import { registerUser,login, refreshAccessToken, logout,registerAdmin } from "../controllers/auth.controller.js";
import { adminEmailValidator, userLoginValidator, userRegisterValidator } from "../validators/index.js";
import validate from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router()
router.route("/register-admin").post(authorizeRoles("ADMIN"),adminEmailValidator(),validate,userRegisterValidator(),validate,registerAdmin)
router.route("/register").post(verifyJWT,authorizeRoles("ADMIN"),adminEmailValidator(),validate,userRegisterValidator(),validate,registerUser)
router.route("/login").post(userLoginValidator(),validate,login)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,logout);

export default router