require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const pool = require('./config/database'); // file database.js đã đổi sang mysql
const { getHomepage } = require('./controllers/homeController.js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get('/', getHomepage);
app.use('/', webAPI);

app.use('/v1/api', apiRoutes);

app.listen(port, () => {
    console.log(`🚀 Backend Nodejs App listening on port ${port}`);
});
