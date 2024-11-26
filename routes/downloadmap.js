const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User"); // Giả sử bạn có mô hình User trong MongoDB
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Đường dẫn đến thư mục 'res' chứa bản đồ
const mapPath = path.join(__dirname, "res", "langdaihoc.map");

// API kiểm tra và tải bản đồ
router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Kiểm tra xem bản đồ có tồn tại trong thư mục 'res' không
    if (!fs.existsSync(mapPath)) {
      return res.status(404).json({ message: "Map not found on server." });
    }

    // Trả về tệp bản đồ cho người dùng nếu cả 2 điều kiện đều đúng
    res.download(mapPath, "langdaihoc.map", (err) => {
      if (err) {
        return res.status(500).json({ message: "Error downloading map." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
