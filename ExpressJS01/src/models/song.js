const pool = require("../config/database");

async function initializeTable() {
  try {
    // Check if column exists
    const [columns] = await pool.execute("SHOW COLUMNS FROM songs LIKE 'listener_count'");
    if (columns.length === 0) {
      await pool.execute("ALTER TABLE songs ADD COLUMN listener_count INT DEFAULT 0");
      console.log('Cột listener_count đã được thêm vào bảng songs.');
    } else {
      console.log('Cột listener_count đã tồn tại trong bảng songs.');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra/thêm cột listener_count:', error);
  }
}

initializeTable();

async function getSongById(id) {
  try {
    const [rows] = await pool.execute(`
      SELECT s.*, c.name AS category_name
      FROM songs s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

async function updateListenerCount(songId, increment = 1) {
  try {
    await pool.execute(
      "UPDATE songs SET listener_count = listener_count + ? WHERE id = ?",
      [increment, songId]
    );
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getSongById,
  updateListenerCount
};
