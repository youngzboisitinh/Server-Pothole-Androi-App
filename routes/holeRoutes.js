/*
const express = require("express");
const { Pothole } = require("../models/pothole");
const auth = require("../middleware/auth"); */


import express from 'express';
import multer from 'multer';
import path from 'path';
import { Pothole } from '../models/pothole.js';
import {auth} from '../middleware/auth.js';

const router = express.Router();

//1. Lấy tất cả các ổ gà
router.get("/all", async (req, res) => {
  try {
    const potholes = await Pothole.find(); //trỏ tới new_potholes
    res.json(potholes);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

//2. Thêm ổ gà mới
router.post("/add", auth, async (req, res) => {
  try {
    const author = req.user.id;
    const { latitude, longitude, type, journey_id, img } = req.body;
    
    const existingPothole = await Pothole.findOne({ latitude, longitude });
    if (existingPothole) {
      return res.status(400).json({ error: "Ổ gà đã tồn tại" });
    }

    const newPothole = new Pothole({
      latitude,
      longitude,
      type,
      state, 
      journey_id,
      author, 
      img, 
    });

    await newPothole.save();
    res.status(201).json(newPothole); 

  } catch (error) {
    console.error("Error saving bump data:", error);
    res.status(500).json({ error: "Failed to save bump data" });
  }
});

// 3. Lấy ổ gà theo id người dùng (author)
router.get("/user/:authorId", async (req, res) => {
  const { authorId } = req.params;

  try {
    // Find potholes by user authorId (author is assumed to be the user ID)
    const userPotholes = await Pothole.find({ author: authorId });

    if (userPotholes.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà nào của người dùng này" });
    }

    res.json(userPotholes);
  } catch (error) {
    console.error("Failed to fetch user potholes:", error);
    res.status(500).json({ error: "Failed to fetch user potholes" });
  }
});

// 4. Cập nhật ổ gà theo user_id và pothole_id
router.put("/update/:userId/:potholeId", async (req, res) => {
  const { userId, potholeId } = req.params;
  const { latitude, longitude, type, state, journey_id, author, img } = req.body;

  try {

    const pothole = await Pothole.findOne({ _id: potholeId, author: userId });

    if (!pothole) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà hoặc người dùng không có quyền sửa ổ gà này" });
    }


    if (latitude) pothole.latitude = latitude;
    if (longitude) pothole.longitude = longitude;
    if (type) pothole.type = type;
    if (state) pothole.state = state;
    if (journey_id) pothole.journey_id = journey_id;
    if (author) pothole.author = author;
    if (img) pothole.img = img;

  
    await pothole.save();

    res.json({ message: "Cập nhật ổ gà thành công", pothole });
  } catch (error) {
    console.error("Error updating pothole:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật ổ gà" });
  }
});

//5. Lấy ổ gà của người dùng hiện tại (dựa trên token)
router.get("/current_user", auth, async (req, res) => {
  const id = req.user.id;

  console.log("day la token trong pothole", id)

  try {
    const userPotholes = await Pothole.find({ author: id });

    if (userPotholes.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà nào của người dùng này" });
    }

    res.json({
      potholes: userPotholes,
    });
  } catch (error) {
    console.error("Lỗi khi lấy ổ gà của người dùng:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu ổ gà" });
  }
});

//6. Xóa toàn bộ nội dung trong bảng pothole
router.delete("/delete_all", async (req, res) => {
  try {
    // Xóa tất cả các bản ghi trong bảng pothole
    await Pothole.deleteMany({});

    res.status(200).json({ message: "Đã xóa tất cả các ổ gà" });
  } catch (error) {
    console.error("Error clearing all potholes:", error);
    res.status(500).json({ error: "Lỗi khi xóa tất cả ổ gà" });
  }
});



// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Thư mục lưu trữ ảnh
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname); // Lấy phần mở rộng của file
    cb(null, `${Date.now()}${extname}`); // Đặt tên file ảnh theo timestamp
  },
});

const upload = multer({ storage });

//7. API để cập nhật ảnh cho ổ gà sau khi ổ gà đã tồn tại
router.put("/update-img/:potholeId", auth, upload.single('img'), async (req, res) => {
  const { potholeId } = req.params;  // Lấy ID ổ gà từ URL
  const { type } = req.body;      
  const img = req.file ? `/uploads/${req.file.filename}` : null; // Đảm bảo rằng ảnh được lưu đúng đường dẫn

  try {
    // Tìm ổ gà theo ID
    const pothole = await Pothole.findById(potholeId);

    if (!pothole) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà" });
    }

    // Cập nhật type nếu có
    if (type) {
      pothole.type = type;
    }

    // Cập nhật ảnh cho ổ gà
    if (img) pothole.img = 'http://localhost:3000/api/img' + img;
    pothole.state = "pending"

    await pothole.save();
    res.json({ message: "Cập nhật ảnh ổ gà thành công", pothole });
  } catch (error) {
    console.error("Error updating pothole image:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật ảnh ổ gà" });
  }
});





export default router;