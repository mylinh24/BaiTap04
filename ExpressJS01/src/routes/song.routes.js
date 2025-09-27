const express = require("express");
const router = express.Router();
const songController = require("../controllers/song.controller");
const auth = require("../middleware/auth");

router.get("/songs", songController.getAllSongs);

router.post("/songs", songController.createSong);
router.get("/songs/with-category", songController.getSongsWithCategories);

// Favorites
router.post("/songs/:songId/favorite", auth, songController.addFavorite);
router.delete("/songs/:songId/favorite", auth, songController.removeFavorite);
router.get("/songs/favorites", auth, songController.getFavorites);
router.get("/songs/:songId/is-favorite", auth, songController.isFavorite);

// Listened
router.post("/songs/:songId/listen", auth, songController.addListen);
router.get("/songs/listened", auth, songController.getListened);
router.get("/songs/:songId/listen-count", songController.getListenCount);

// Similar
router.get("/songs/:songId/similar", songController.getSimilarSongs);

// Comments
router.post("/songs/:songId/comments", auth, songController.addComment);
router.get("/songs/:songId/comments", songController.getComments);
router.delete("/comments/:commentId", auth, songController.deleteComment);

module.exports = router;
