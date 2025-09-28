require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'bt04_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection().then(conn => {
  console.log("✅ Connected to MySQL database pool");
  conn.release();
}).catch(error => {
  console.error("MySQL pool connection failed:", error.message);
  process.exit(1);
});

module.exports = pool;
