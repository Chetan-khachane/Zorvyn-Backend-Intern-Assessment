import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { transactionValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js"
import { createTransaction,getTransactionById,getTransactions,updateTransaction,deleteTransaction } from "../controllers/transactions.controller.js";

const router = Router()

router.use(verifyJWT)

router.post(
  "/",
  authorizeRoles("CUSTOMER"),
  transactionValidator(),
  validate,
  createTransaction
);

// Get all (with filters)
router.get(
  "/",
  authorizeRoles("CUSTOMER", "ADMIN", "ANALYST"),
  getTransactions
);

// Get one
router.get(
  "/:id",
  authorizeRoles("CUSTOMER", "ADMIN", "ANALYST"),
  getTransactionById
);

router.put(
  "/:id",
  authorizeRoles("CUSTOMER", "ADMIN"),
  updateTransaction
);

router.delete(
  "/:id",
  authorizeRoles("CUSTOMER", "ADMIN"),
  deleteTransaction
);



export default router;