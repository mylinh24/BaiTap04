const connection = require("../config/database");

async function initializeTable() {
  const conn = await connection();
  try {
    // Check if column exists
    const [columns] = await conn.execute("SHOW COLUMNS FROM songs LIKE 'listener_count'");
    if (columns.length === 0) {
      await conn.execute("ALTER TABLE songs ADD COLUMN listener_count INT DEFAULT 0");
      console.log('Cột listener_count đã được thêm vào bảng songs.');
    } else {
      console.log('Cột listener_count đã tồn tại trong bảng songs.');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra/thêm cột listener_count:', error);
  } finally {
    conn.end();
  }
}

initializeTable();

async function getSongById(id) {
  const conn = await connection();
  try {
    const [rows] = await conn.execute(`
      SELECT s.*, c.name AS category_name
      FROM songs s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  } finally {
    conn.end();
  }
}

async function updateListenerCount(songId, increment = 1) {
  const conn = await connection();
  try {
    await conn.execute(
      "UPDATE songs SET listener_count = listener_count + ? WHERE id = ?",
      [increment, songId]
    );
  } catch (error) {
    throw error;
  } finally {
    conn.end();
  }
}

module.exports = {
  getSongById,
  updateListenerCount
};
