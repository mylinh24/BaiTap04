const pool = require("../config/database");

async function initializeTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS listened_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      );
    `;
    await pool.execute(createTableQuery);
    console.log('Bảng listened_history đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('Lỗi khi tạo bảng listened_history:', error);
  }
}

initializeTable();

async function addListen(userId, songId) {
  try {
    await pool.execute(
      "INSERT INTO listened_history (user_id, song_id) VALUES (?, ?)",
      [userId, songId]
    );
    // Increment listener_count in songs
    await pool.execute(
      "UPDATE songs SET listener_count = listener_count + 1 WHERE id = ?",
      [songId]
    );
    return true;
  } catch (error) {
    throw error;
  }
}

async function getListenedByUser(userId) {
  try {
    const [rows] = await pool.execute(`
      SELECT lh.*, s.title, s.artist, s.audio_url, s.image_url, c.name AS category_name
      FROM listened_history lh
      JOIN songs s ON lh.song_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE lh.user_id = ?
      ORDER BY lh.listened_at DESC
    `, [userId]);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getListenCount(songId) {
  try {
    const [rows] = await pool.execute(
      "SELECT listener_count FROM songs WHERE id = ?",
      [songId]
    );
    return rows[0]?.listener_count || 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addListen,
  getListenedByUser,
  getListenCount
};
