const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { getAllSongs, createSong, getSongsWithCategories } = require('../controllers/song.controller');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// Loại bỏ routerAPI.all("/*", auth) và áp dụng auth cho các route cụ thể
routerAPI.get('/', (req, res) => {
    return res.status(200).json('Hello world api');
});

routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

routerAPI.get('/user', auth, getUser); 
routerAPI.get('/account', delay, getAccount); 
routerAPI.get('/songs', getAllSongs);
routerAPI.post('/songs', createSong);
routerAPI.get('/songs/with-category', getSongsWithCategories);
module.exports = routerAPI;