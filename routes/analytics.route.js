import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";


const router = Router()

app.use(verifyJWT)

app.get("/top-spending",getTopSpending)
app.get("/top-income",getTopIncome)
app.get("/user-growth",getTotalUserGrowth)
app.get("/user-churn",getTotalUserChurn)
app.get("/summary",getSummary)


// GET /analytics/top-spending?period=monthly
// GET /analytics/top-income?period=monthly
// GET /analytics/user-growth?period=monthly
// GET /analytics/user-churn?period=monthly
// GET /analytics/income-vs-expense?period=monthly

export default router