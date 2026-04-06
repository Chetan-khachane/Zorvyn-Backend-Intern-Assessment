import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSummary,getCategoryWiseSummary,getRecentTransactions,getTrends } from "../controllers/dashboard.controller.js";
import { userTransactionTrendValidator } from "../validators/index.js";
import validate from "../middlewares/validator.middleware.js";

const router = Router()

router.use(verifyJWT)

router.get("/summary",getSummary)
router.get("/category-wise",getCategoryWiseSummary)
router.get("/recent/:limit",getRecentTransactions)
router.get("/trends/",userTransactionTrendValidator(),validate,getTrends)



// GET /dashboard/summary
// GET /dashboard/category-wise
// GET /dashboard/recent
// GET /dashboard/trends

export default router