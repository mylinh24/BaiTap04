require('dotenv').config();
const pool = require('./src/config/database');

async function cleanComments() {
  try {
    // Delete invalid comments: empty comment or user_id not in users
    const [result] = await pool.execute(`
      DELETE FROM comments
      WHERE comment IS NULL OR comment = ''
      OR user_id NOT IN (SELECT id FROM users)
    `);
    console.log(`Cleaned ${result.affectedRows} invalid comments.`);

    // Optional: Show remaining comments
    const [rows] = await pool.execute(`
      SELECT c.*, u.email AS user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
    `);
    console.log('Remaining comments:', rows.length);
    rows.forEach(row => {
      console.log(`- ID: ${row.id}, Song: ${row.song_id}, User: ${row.user_email || 'Unknown'}, Comment: "${row.comment || 'EMPTY'}"`);
    });
  } catch (error) {
    console.error('Error cleaning comments:', error);
  }
}

cleanComments();
