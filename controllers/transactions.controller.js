import { asyncHandler } from "../utils/async-handler.js";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db/db.config.js";
import { query } from "express-validator";

const createTransaction = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const id = user[0][0].id;

  const { amount, type, category, note } = req.body;

  const [transTypeResult] = await pool.query(
    "SELECT * FROM transaction_type WHERE trans_type=?",
    [type.toUpperCase()],
  );
  const [categoryTypeResult] = await pool.query(
    "SELECT * FROM category WHERE category=?",
    [category.toUpperCase()],
  );

  const transType = transTypeResult[0].id;
  const categoryType = categoryTypeResult[0].cat_id;

  const transactionId = uuidv4();
  await pool.query(
    "INSERT INTO transactions (id,user_id,amount,type_id,category_id,note) VALUES (?,?,?,?,?,?)",
    [transactionId, id, amount, transType, categoryType, note],
  );

  res.status(200).json({
    message: "Added transaction Successfully",
    amount: amount,
    transaction_id: transactionId,
  });
});

const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, from, to, userId } = req.query; //filter based query

  const userRole = req.user.role;

  //for query params
  if (Object.keys(req.query).length > 0) {
    let query = `
                SELECT 
                t.id,
                t.user_id,
                t.amount,
                tt.trans_type AS type,
                c.category AS category,
                t.note,
                t.created_at
                FROM transactions t
                JOIN transaction_type tt ON t.type_id = tt.id
                JOIN category c ON t.category_id = c.cat_id
                WHERE 1=1
                `;
    if (type) {
      const [transactionType] = await pool.query(
        "SELECT * from transaction_type WHERE trans_type=?",
        [type.toUpperCase()],
      );
      query += ` AND tt.id=${transactionType[0].id}`;
    }
    if (category) {
      const [categoryType] = await pool.query(
        "SELECT * from category WHERE category=?",
        [category.toUpperCase()],
      );
      query += ` AND c.cat_id=${categoryType[0].cat_id}`;
    }
    if (from && to) {
      query += ` AND t.created_at BETWEEN '${from} 00:00:00' AND '${to} 23:59:59'`;
    }

    if (from && !to) {
      query += ` AND t.created_at >= '${from} 00:00:00'`;
    }

    if (!from && to) {
      query += ` AND t.created_at <= '${to} 23:59:59'`;
    }

    
    if (userRole !== "CUSTOMER") {
      if (userId) query += ` AND t.user_id=${userId}`;
    } else if(userId) {
      return res.status(403).json({
        message: "CUSTOMER can't perform user id transaction views",
      });
    }

    const [fetchedTransactions] = await pool.query(query);
    res.status(200).json({
      message: "Successfully Fetched Transactions",
      transactions: fetchedTransactions,
      total_transactions: fetchedTransactions.length,
    });
    return;
  }
  //with no query params
  const { user } = req.user;
  const requestedUserId = user[0][0].id;
  const [fetchedTransactions] = await pool.query(
    "SELECT * FROM transactions WHERE user_id=?",
    [requestedUserId],
  );

  res.status(200).json({
    message: "Successfully Fetched Transactions",
    totalTransactions: fetchedTransactions.length,
    transactions: fetchedTransactions,
  });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction_id = req.params.id;
  let query = `
                SELECT 
                t.id,
                t.user_id,
                t.amount,
                tt.trans_type AS type,
                c.category AS category,
                t.note,
                t.created_at
                FROM transactions t
                JOIN transaction_type tt ON t.type_id = tt.id
                JOIN category c ON t.category_id = c.cat_id
                WHERE t.id=?`;
  const [fetchedTransactions] = await pool.query(query, [transaction_id]);
  res.status(200).json({
    message: "Successfully Fetched Transactions",
    totalTransactions: fetchedTransactions.length,
    transactions: fetchedTransactions,
  });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction_id = req.params.id;
  const { amount, type, category, note } = req.body;

  const [rows] = await pool.query("SELECT * FROM transactions WHERE id = ?", [
    transaction_id,
  ]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const transaction = rows[0];

  const { user } = req.user;
  const id = user[0][0].id;
  if (
    req.user.role === "CUSTOMER" &&
    transaction.user_id !== id //allow only ADMIN and CUSTOMER
  ) {
    return res.status(403).json({ message: "Not allowed" });
  }

  let type_id = transaction.type_id;
  if (type) {
    const [typeResult] = await pool.query(
      "SELECT id FROM transaction_type WHERE trans_type = ?",
      [type.toUpperCase()],
    );

    if (typeResult.length === 0) {
      return res.status(400).json({ message: "Invalid type" });
    }

    type_id = typeResult[0].id;
  }

  let category_id = transaction.category_id;
  if (category) {
    const [categoryResult] = await pool.query(
      "SELECT cat_id FROM category WHERE category = ?",
      [category.toUpperCase()],
    );

    if (categoryResult.length === 0) {
      return res.status(400).json({ message: "Invalid category" });
    }

    category_id = categoryResult[0].cat_id;
  }

  await pool.query(
    `UPDATE transactions 
     SET amount = ?, type_id = ?, category_id = ?, note = ?
     WHERE id = ?`,
    [
      amount ?? transaction.amount,
      type_id,
      category_id,
      note ?? transaction.note,
      transaction_id,
    ],
  );

  res.json({ message: "Transaction updated successfully" });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction_id = req.params.id;

  const [rows] = await pool.query("SELECT * FROM transactions WHERE id = ?", [
    transaction_id,
  ]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const transaction = rows[0];

  const { user } = req.user;
  const id = user[0][0].id;

  if (req.user.role === "CUSTOMER" && transaction.user_id !== id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await pool.query("DELETE FROM transactions WHERE id = ?", [transaction_id]);

  res.json({ message: "Transaction deleted successfully" });
});

export {
  createTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
