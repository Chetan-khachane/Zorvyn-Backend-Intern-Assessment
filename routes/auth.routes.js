import { Router } from "express";
import { registerUser,login, refreshAccessToken, logout } from "../controllers/auth.controller.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import validate from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(userRegisterValidator(),validate,registerUser)
router.route("/login").post(userLoginValidator(),validate,login)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,logout);

export default router