const pool = require("../config/database");

async function initializeTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      );
    `;
    await pool.execute(createTableQuery);
    console.log('Bảng comments đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('Lỗi khi tạo bảng comments:', error);
  }
}

initializeTable();

async function addComment(userId, songId, comment) {
  try {
    const [result] = await pool.execute(
      "INSERT INTO comments (user_id, song_id, comment) VALUES (?, ?, ?)",
      [userId, songId, comment]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
}

async function getCommentsBySong(songId) {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, u.email AS user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.song_id = ?
      ORDER BY c.created_at DESC
    `, [songId]);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function deleteComment(commentId, userId) {
  try {
    await pool.execute(
      "DELETE FROM comments WHERE id = ? AND user_id = ?",
      [commentId, userId]
    );
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addComment,
  getCommentsBySong,
  deleteComment
};
