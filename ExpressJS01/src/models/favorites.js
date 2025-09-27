const connection = require("../config/database");

async function initializeTable() {
  const conn = await connection();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INT NOT NULL,
      song_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, song_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
  `;
  try {
    await conn.execute(createTableQuery);
    console.log('Bảng favorites đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('Lỗi khi tạo bảng favorites:', error);
  } finally {
    conn.end();
  }
}

initializeTable();

async function addFavorite(userId, songId) {
  const conn = await connection();
  try {
    await conn.execute(
      "INSERT INTO favorites (user_id, song_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP",
      [userId, songId]
    );
    return true;
  } catch (error) {
    throw error;
  } finally {
    conn.end();
  }
}

async function removeFavorite(userId, songId) {
  const conn = await connection();
  try {
    await conn.execute(
      "DELETE FROM favorites WHERE user_id = ? AND song_id = ?",
      [userId, songId]
    );
    return true;
  } catch (error) {
    throw error;
  } finally {
    conn.end();
  }
}

async function getFavoritesByUser(userId) {
  const conn = await connection();
  try {
    const [rows] = await conn.execute(`
      SELECT s.*, c.name AS category_name
      FROM favorites f
      JOIN songs s ON f.song_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    return rows;
  } catch (error) {
    throw error;
  } finally {
    conn.end();
  }
}

async function isFavorite(userId, songId) {
  const conn = await connection();
  try {
    const [rows] = await conn.execute(
      "SELECT 1 FROM favorites WHERE user_id = ? AND song_id = ?",
      [userId, songId]
    );
    return rows.length > 0;
  } catch (error) {
    throw error;
  } finally {
    conn.end();
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
  isFavorite
};
