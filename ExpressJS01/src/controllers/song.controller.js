const connection = require("../config/database");
const elasticClient = require('../config/elasticConfig');

// Hàm đồng bộ một bài hát vào Elasticsearch
async function indexSong(songData) {
  try {
    await elasticClient.index({
      index: 'songs',
      id: songData.id.toString(), // Elasticsearch cần id là string
      body: {
        id: songData.id,
        title: songData.title,
        artist: songData.artist,
        audio_url: songData.audio_url,
        image_url: songData.image_url,
        category_id: songData.category_id,
        category_name: songData.category_name || null, // Thêm nếu có từ join
      },
    });
    console.log(`Đã đồng bộ song ID ${songData.id} vào Elasticsearch`);
  } catch (error) {
    console.error('Lỗi đồng bộ song:', error.message);
  }
}

exports.getAllSongs = async (req, res) => {
  try {
    const conn = await connection();
    const [rows] = await conn.execute(
      `SELECT songs.*, categories.name AS category_name
       FROM songs 
       LEFT JOIN categories ON songs.category_id = categories.id`
    );

    for (const song of rows) {
      await indexSong(song);
    }

    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createSong = async (req, res) => {
  try {
    const { title, artist, audio_url, image_url, category_id } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ message: "Thiếu thông tin bài hát" });
    }

    const conn = await connection();
    await conn.execute(
      `INSERT INTO songs (title, artist, audio_url, image_url, category_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, artist, audio_url, image_url, category_id]
    );
    const newSong = {
      id: result.insertId,
      title,
      artist,
      audio_url,
      image_url,
      category_id,
      category_name: null, // Có thể lấy từ categories sau nếu cần
    };
    res.status(201).json({ message: "✅ Bài hát đã được thêm" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getSongsWithCategories = async (req, res) => {
  try {
    const conn = await connection();
    const [rows] = await conn.execute(`
      SELECT s.id, s.title, s.artist, s.audio_url, s.image_url, 
             c.name AS category_name
      FROM songs s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.title
    `);
    // Đồng bộ dữ liệu vào Elasticsearch
    for (const song of rows) {
      await indexSong(song);
    }
    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};