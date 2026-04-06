import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { getTopIncome,getTopSpending,getSummary } from "../controllers/analytics.controller.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { analyticsValidator } from "../validators/index.js";
import { validate } from "uuid";

const router = Router()

router.use(verifyJWT)

router.get("/top-spending",authorizeRoles("ADMIN","ANALYST"),analyticsValidator(),validate,getTopSpending)
router.get("/top-income",authorizeRoles("ADMIN","ANALYST"),analyticsValidator(),validate,getTopIncome)
router.get("/summary",authorizeRoles("ADMIN","ANALYST"),analyticsValidator(),validate,getSummary)


export default router