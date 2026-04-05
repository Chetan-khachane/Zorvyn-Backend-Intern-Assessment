import mysql from 'mysql2/promise';

console.log(process.env.DB_USER)

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to Database");
    connection.release(); 
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
};

export { connectDB, pool };