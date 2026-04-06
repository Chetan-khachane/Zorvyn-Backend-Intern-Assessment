import { pool } from "../db/db.config.js";
import { asyncHandler } from "../utils/async-handler.js";

const getTopSpending = asyncHandler(async (req, res) => {
  const { period, activeOnly = false } = req.query;
  let query = "";
  switch (period) {
    case "weekly":
      query = `SELECT * FROM (
                        SELECT 
                            CONCAT(YEAR(t.created_at), '-W', WEEK(t.created_at)) AS period,
                            c.category,
                            SUM(t.amount) AS total_spent,
                            RANK() OVER (
                            PARTITION BY CONCAT(YEAR(t.created_at), '-W', WEEK(t.created_at))
                            ORDER BY SUM(t.amount) DESC
                            ) AS rnk
                        FROM transactions t
                        JOIN category c ON t.category_id = c.cat_id
                        JOIN transaction_type tt ON t.type_id = tt.id
                        ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                        WHERE tt.trans_type = 'EXPENSE'
                        GROUP BY 
                            CONCAT(YEAR(t.created_at), '-W', WEEK(t.created_at)),
                            c.category
                        ) ranked
                        WHERE rnk = 1
                        ORDER BY period;`;
      break;

    case "yearly":
      query = `SELECT * FROM (
                            SELECT 
                                YEAR(t.created_at) AS period,
                                c.category,
                                SUM(t.amount) AS total_spent,
                                RANK() OVER (
                                PARTITION BY YEAR(t.created_at)
                                ORDER BY SUM(t.amount) DESC
                                ) AS rnk
                            FROM transactions t
                            JOIN category c ON t.category_id = c.cat_id
                            JOIN transaction_type tt ON t.type_id = tt.id
                            ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                            WHERE tt.trans_type = 'EXPENSE'
                            GROUP BY period, c.category
                            ) ranked
                            WHERE rnk = 1;`;
      break;
    default:
      query = `SELECT * FROM (
                        SELECT 
                            DATE_FORMAT(t.created_at, '%Y-%m') AS period,
                            c.category,
                            SUM(t.amount) AS total_spent,
                            RANK() OVER (
                            PARTITION BY DATE_FORMAT(t.created_at, '%Y-%m')
                            ORDER BY SUM(t.amount) DESC
                            ) AS rnk
                        FROM transactions t
                        JOIN category c ON t.category_id = c.cat_id
                        JOIN transaction_type tt ON t.type_id = tt.id
                        ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                        WHERE tt.trans_type = 'EXPENSE'
                        GROUP BY period, c.category
                        ) ranked
                        WHERE rnk = 1;`;
      break;
  }

  const [rows] = await pool.query(query);

  res.status(200).json({
    message: `Fetched Top Spending Category ${period ? period : "monthly"} for ${activeOnly ? "only active users" : "all users"}`,
    topSpendingCategory: rows,
  });
});

const getTopIncome = asyncHandler(async (req, res) => {
  const { period, activeOnly = false } = req.query;
  let query = "";
  switch (period) {
    case "weekly":
      query = `SELECT * FROM (
                                SELECT 
                                    YEAR(t.created_at) AS year,
                                    WEEK(t.created_at) AS week,
                                    c.category,
                                    SUM(t.amount) AS total_income,
                                    RANK() OVER (
                                    PARTITION BY YEAR(t.created_at), WEEK(t.created_at)
                                    ORDER BY SUM(t.amount) DESC
                                    ) AS rnk
                                FROM transactions t
                                JOIN category c ON t.category_id = c.cat_id
                                JOIN transaction_type tt ON t.type_id = tt.id
                                ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                                WHERE tt.trans_type = 'INCOME'
                                GROUP BY year, week, c.category
                                ) ranked
                                WHERE rnk = 1
                                ORDER BY year, week;`;
      break;

    case "yearly":
      query = `SELECT * FROM (
                                SELECT 
                                    YEAR(t.created_at) AS period,
                                    c.category,
                                    SUM(t.amount) AS total_income,
                                    RANK() OVER (
                                    PARTITION BY YEAR(t.created_at)
                                    ORDER BY SUM(t.amount) DESC
                                    ) AS rnk
                                FROM transactions t
                                JOIN category c ON t.category_id = c.cat_id
                                JOIN transaction_type tt ON t.type_id = tt.id
                                ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                                WHERE tt.trans_type = 'INCOME'
                                GROUP BY period, c.category
                                ) ranked
                                WHERE rnk = 1
                                ORDER BY period;`;
      break;
    default:
      query = `SELECT * FROM (
                                SELECT 
                                    DATE_FORMAT(t.created_at, '%Y-%m') AS period,
                                    c.category,
                                    SUM(t.amount) AS total_income,
                                    RANK() OVER (
                                    PARTITION BY DATE_FORMAT(t.created_at, '%Y-%m')
                                    ORDER BY SUM(t.amount) DESC
                                    ) AS rnk
                                FROM transactions t
                                JOIN category c ON t.category_id = c.cat_id
                                JOIN transaction_type tt ON t.type_id = tt.id
                                ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                                WHERE tt.trans_type = 'INCOME'
                                GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), c.category
                                ) ranked
                                WHERE rnk = 1
                                ORDER BY period;`;
      break;
  }

  const [rows] = await pool.query(query);

  res.status(200).json({
    message: `Fetched Top Income Category ${period ? period : "monthly"} for ${activeOnly ? "only active users" : "all users"}`,
    topIncome: rows,
  });
});

const getSummary = asyncHandler(async (req, res) => {
  const { period, activeOnly = false } = req.query;
  //monthly summary
  let query = "";

  switch (period) {
    case "weekly":
      query = `SELECT 
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
                            ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                            GROUP BY year, week
                            ORDER BY year, week;`;
      break;

    case "yearly":
      query = `SELECT 
                            YEAR(t.created_at) AS period,
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
                            ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                            GROUP BY period
                            ORDER BY period;`;
      break;
    default:
      query = `SELECT 
                                DATE_FORMAT(t.created_at, '%Y-%m') AS period,
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
                                ${activeOnly ? "JOIN users u ON t.user_id = u.id WHERE u.is_active = TRUE" : ""}
                                GROUP BY period
                                ORDER BY period;`;
      break;
  }

  const [rows] = await pool.query(query);

  res.status(200).json({
    message: `Fetched Summary Statement ${period ? period : "monthly"} for ${activeOnly ? "only active users" : "all users"}`,
    summary: rows[0],
  });
});

export { getSummary, getTopSpending, getTopIncome };
