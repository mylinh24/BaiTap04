const pool = require("../config/database");

// Định nghĩa bảng Users trong MySQL
async function initializeTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    );
  `;
  try {
    await pool.execute(createTableQuery);
    console.log('Bảng users đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('Lỗi khi tạo bảng:', error);
  }
}

// Khởi tạo bảng khi module được tải
initializeTable();

// Xuất module để sử dụng
module.exports = {
  pool, // Xuất pool để sử dụng trong các file khác
  createUser: async (userData) => {
    const { name, email, password, role } = userData;
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    try {
      const [result] = await pool.execute(query, [name, email, password, role]);
      return result.insertId; // Trả về ID của bản ghi vừa tạo
    } catch (error) {
      throw error;
    }
  },
  findUserByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null; // Trả về người dùng hoặc null nếu không tìm thấy
    } catch (error) {
      throw error;
    }
  },
  getUserById: async (id) => {
    const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

};