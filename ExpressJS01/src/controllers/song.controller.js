const pool = require("../config/database");
const elasticClient = require('../config/elasticConfig');
const favoritesModel = require('../models/favorites');
const listenedHistoryModel = require('../models/listenedHistory');
const commentsModel = require('../models/comments');
const songModel = require('../models/song');

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
        listener_count: songData.listener_count || 0,
      },
    });
    console.log(`Đã đồng bộ song ID ${songData.id} vào Elasticsearch`);
  } catch (error) {
    console.error('Lỗi đồng bộ song:', error.message);
  }
}

exports.getAllSongs = async (req, res) => {
  try {
    const [rows] = await pool.execute(
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

    const [result] = await pool.execute(
      `INSERT INTO songs (title, artist, audio_url, image_url, category_id, listener_count)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [title, artist, audio_url, image_url, category_id]
    );
    const newSong = {
      id: result.insertId,
      title,
      artist,
      audio_url,
      image_url,
      category_id,
      listener_count: 0,
      category_name: null, // Có thể lấy từ categories sau nếu cần
    };
    await indexSong(newSong);
    res.status(201).json({ message: "✅ Bài hát đã được thêm" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getSongsWithCategories = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id, s.title, s.artist, s.audio_url, s.image_url, s.listener_count,
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

// Favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.songId;
    await favoritesModel.addFavorite(userId, songId);
    res.json({ message: "Đã thêm vào yêu thích" });
  } catch (error) {
    console.error("Lỗi thêm yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.songId;
    await favoritesModel.removeFavorite(userId, songId);
    res.json({ message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    console.error("Lỗi xóa yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await favoritesModel.getFavoritesByUser(userId);
    res.json(favorites);
  } catch (error) {
    console.error("Lỗi lấy yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.isFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.songId;
    const isFav = await favoritesModel.isFavorite(userId, songId);
    res.json({ isFavorite: isFav });
  } catch (error) {
    console.error("Lỗi kiểm tra yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Listened History
exports.addListen = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.songId;
    await listenedHistoryModel.addListen(userId, songId);
    // Reindex the song after updating listener_count
    const song = await songModel.getSongById(songId);
    if (song) {
      await indexSong(song);
    }
    res.json({ message: "Đã ghi nhận lượt nghe" });
  } catch (error) {
    console.error("Lỗi ghi nhận lượt nghe:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getListened = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await listenedHistoryModel.getListenedByUser(userId);
    res.json(history);
  } catch (error) {
    console.error("Lỗi lấy lịch sử nghe:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getListenCount = async (req, res) => {
  try {
    const songId = req.params.songId;
    const count = await listenedHistoryModel.getListenCount(songId);
    res.json({ listener_count: count });
  } catch (error) {
    console.error("Lỗi lấy số lượt nghe:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Similar Songs
exports.getSimilarSongs = async (req, res) => {
  try {
    const songId = req.params.songId;
    const song = await songModel.getSongById(songId);
    if (!song) {
      return res.status(404).json({ message: "Bài hát không tồn tại" });
    }
    // Use Elasticsearch for similar songs: same category or similar artist
    const { body } = await elasticClient.search({
      index: 'songs',
      body: {
        query: {
          bool: {
            should: [
              { term: { category_id: song.category_id } },
              { fuzzy: { artist: { value: song.artist, fuzziness: 'AUTO' } } }
            ],
            minimum_should_match: 1
          }
        },
        _source: ['id', 'title', 'artist', 'audio_url', 'image_url', 'category_id', 'category_name', 'listener_count'],
        size: 10
      }
    });
    const similarSongs = body.hits.hits.map(hit => ({
      id: hit._source.id,
      title: hit._source.title,
      artist: hit._source.artist,
      audio_url: hit._source.audio_url,
      image_url: hit._source.image_url,
      category_id: hit._source.category_id,
      category_name: hit._source.category_name,
      listener_count: hit._source.listener_count
    })).filter(s => s.id != songId);
    res.json(similarSongs);
  } catch (error) {
    console.error("Lỗi lấy bài hát tương tự:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Comments
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.songId;
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: "Thiếu nội dung bình luận" });
    }
    const commentId = await commentsModel.addComment(userId, songId, comment);
    res.status(201).json({ id: commentId, message: "Đã thêm bình luận" });
  } catch (error) {
    console.error("Lỗi thêm bình luận:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const songId = req.params.songId;
    const comments = await commentsModel.getCommentsBySong(songId);
    res.json(comments);
  } catch (error) {
    console.error("Lỗi lấy bình luận:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    await commentsModel.deleteComment(commentId, userId);
    res.json({ message: "Đã xóa bình luận" });
  } catch (error) {
    console.error("Lỗi xóa bình luận:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
