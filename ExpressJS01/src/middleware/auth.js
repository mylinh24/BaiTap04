require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // file kết nối MySQL

const auth = async (req, res, next) => {
    const white_lists = ["/", "/register", "/login"];

    // Cho phép các route không cần xác thực
    if (white_lists.find(item => req.originalUrl.startsWith(item))) {
        return next();
    }

    // Lấy token từ header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn"
        });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kiểm tra user có tồn tại trong MySQL không
        const conn = await db.getConnection();
        try {
            const [rows] = await conn.execute("SELECT id, email, name FROM users WHERE email = ?", [decoded.email]);
            if (rows.length === 0) {
                return res.status(401).json({ message: "Người dùng không tồn tại" });
            }

            // Gán user vào request để sử dụng sau
            req.user = {
                id: rows[0].id,
                email: rows[0].email,
                name: rows[0].name
            };

            console.log(">>> check token decoded: ", decoded);
            next();
        } finally {
            conn.release();
        }

    } catch (error) {
        return res.status(401).json({
            message: "Token bị hết hạn/hoặc không hợp lệ"
        });
    }
};

module.exports = auth;
