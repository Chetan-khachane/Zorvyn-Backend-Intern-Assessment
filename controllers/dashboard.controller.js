import { asyncHandler } from "../utils/async-handler.js";
import { pool } from "../db/db.config.js";
import { query } from "express-validator";

const getSummary = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const id = user[0][0].id;

  const query = `SELECT 
            SUM(CASE WHEN tt.trans_type = 'INCOME' THEN t.amount ELSE 0 END) AS total_income,
            SUM(CASE WHEN tt.trans_type = 'EXPENSE' THEN t.amount ELSE 0 END) AS total_expense,
            SUM(
                CASE 
                WHEN tt.trans_type = 'INCOME' THEN t.amount
                ELSE -t.amount
                END
            ) AS net_balance
            FROM transactions t
            JOIN transaction_type tt ON t.type_id = tt.id
            WHERE t.user_id = ?`;

  const [result] = await pool.query(query, [id]);

  res.status(200).json({
    message: "Summary Generated",
    summary: result[0],
  });
});

const getCategoryWiseSummary = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const id = user[0][0].id;

  const query = `SELECT 
        c.category,
        SUM(t.amount) AS total
        FROM transactions t
        JOIN category c ON t.category_id = c.cat_id
        WHERE t.user_id = ?
        GROUP BY c.category`;

  const [result] = await pool.query(query, [id]);
  res.status(200).json({
    message: "Category Wise Summary Generated",
    summary: result,
    totalTransactions: result.length,
  });
});

const getRecentTransactions = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const id = user[0][0].id;

  const limit = req.params.limit;
  const query = `SELECT 
            t.id,
            t.amount,
            tt.trans_type AS type,
            c.category,
            t.created_at
            FROM transactions t
            JOIN transaction_type tt ON t.type_id = tt.id
            JOIN category c ON t.category_id = c.cat_id
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC
            LIMIT ${limit ? limit : 5};`;

  const [result] = await pool.query(query, [id]);
  res.status(200).json({
    message: "Category Wise Summary Generated",
    summary: result,
    totalTransactions: result.length,
  });
});

const getTrends = asyncHandler(async (req, res) => {
  const { period = "monthly" } = req.query;

  const { user } = req.user;
  const id = user[0][0].id;

  let query = "";

  if (period === "weekly") {
    query = `
            SELECT 
        YEAR(t.created_at) AS year,
        WEEK(t.created_at) AS week,
        SUM(CASE WHEN tt.trans_type = 'INCOME' THEN t.amount ELSE 0 END) AS income,
        SUM(CASE WHEN tt.trans_type = 'EXPENSE' THEN t.amount ELSE 0 END) AS expense,
        SUM(
            CASE 
            WHEN tt.trans_type = 'INCOME' THEN t.amount
            ELSE -t.amount
            END
        ) AS net
        FROM transactions t
        JOIN transaction_type tt ON t.type_id = tt.id
        WHERE t.user_id = ?
        GROUP BY year, week
        ORDER BY year, week;
    `;
  } else {
    query = `
        SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m') AS month,
        SUM(CASE WHEN tt.trans_type = 'INCOME' THEN t.amount ELSE 0 END) AS income,
        SUM(CASE WHEN tt.trans_type = 'EXPENSE' THEN t.amount ELSE 0 END) AS expense,
        SUM(
            CASE 
            WHEN tt.trans_type = 'INCOME' THEN t.amount
            ELSE -t.amount
            END
        ) AS net
        FROM transactions t
        JOIN transaction_type tt ON t.type_id = tt.id
        WHERE t.user_id = ?
        GROUP BY month
        ORDER BY month`;
  }

  const [rows] = await pool.query(query, [id]);
  res.status(200).json({
    message: `Transaction data for ${period} trend`,
    transactions: rows,
    totalTransactions: rows.length,
  });
});

export { getSummary, getCategoryWiseSummary, getRecentTransactions, getTrends };
