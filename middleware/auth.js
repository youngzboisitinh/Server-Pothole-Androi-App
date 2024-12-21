import jwt from "jsonwebtoken";



function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Gán thông tin người dùng vào request để sử dụng ở các route khác
    next(); // Tiếp tục với middleware hoặc route tiếp theo
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
}

export {auth};
