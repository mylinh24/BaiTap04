require('dotenv').config();
const mysql = require('mysql2/promise');

const connection = async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_NAME || 'bt04_project'
    });

    console.log("✅ Connected to MySQL database");
    return conn;
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1); 
  }
};

module.exports = connection;