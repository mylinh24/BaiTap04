const { createUserService, loginService, getUserService } = require('../services/userService');

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const data = await createUserService(name, email, password);
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ message: 'Tạo người dùng thất bại' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await loginService(email, password);
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ message: 'Đăng nhập thất bại' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

const getAccount = async (req, res) => {
    try {
        const data = await getUserService();
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ message: 'Không tìm thấy tài khoản' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
const { getUserById } = require('../models/user');

const getUser = async (req, res) => {
  try {
    const userId = req.query.id || 1; // ví dụ lấy id từ query
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
};