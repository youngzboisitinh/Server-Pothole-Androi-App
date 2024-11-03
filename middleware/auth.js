const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Lấy token từ header Authorization
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Thêm xử lý trường hợp Bearer token
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gán thông tin người dùng vào request để sử dụng ở các route khác
    next(); // Tiếp tục với middleware hoặc route tiếp theo
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

module.exports = auth;

