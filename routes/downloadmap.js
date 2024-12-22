import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js'; // Đảm bảo export đúng từ model
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Điều chỉnh đường dẫn sao cho đúng:
const mapPath = join(__dirname, '..', 'res', 'langdaihoc.map');

router.post("/", async (req, res) => {
  const {email} = req.body;

  try {
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Kiểm tra xem file map có tồn tại không
    if (!fs.existsSync(mapPath)) {
      console.error("Map file not found:", mapPath); // Debug đường dẫn
      return res.status(404).json({ message: "Map not found on server." });
    }

    // Tải xuống file map
    res.download(mapPath, "langdaihoc.map", (err) => {
      if (err) {
        console.error("Download error:", err); // Debug lỗi cụ thể
        return res.status(500).json({ message: "Error downloading map." });
      }
    });
  } catch (error) {
    console.error("Server error:", error); // Debug lỗi server
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
