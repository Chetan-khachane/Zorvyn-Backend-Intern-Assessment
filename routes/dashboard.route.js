import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSummary,getCategoryWiseSummary,getRecentTransactions,getTrends } from "../controllers/dashboard.controller.js";
import { userTransactionTrendValidator } from "../validators/index.js";
import validate from "../middlewares/validator.middleware.js";

import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router()

router.use(verifyJWT)

router.get("/summary",authorizeRoles("CUSTOMER"),getSummary)
router.get("/category-wise",authorizeRoles("CUSTOMER"),getCategoryWiseSummary)
router.get("/recent/:limit",authorizeRoles("CUSTOMER"),getRecentTransactions)
router.get("/trends/",authorizeRoles("CUSTOMER"),userTransactionTrendValidator(),validate,getTrends)



export default router