/*
const express = require('express');
const { Journey } = require('../models/journey');
const auth = require('../middleware/auth');
*/

import express from 'express';
import { Journey } from '../models/journey.js';  // Chú ý thêm .js
import {auth} from '../middleware/auth.js';  // Chú ý thêm .js
const router = express.Router();

//1. Thêm journey mới
router.post("/add", auth, async (req, res) => {
  console.log("Api đang chạy nha")
  try {
    const user_id = req.user.id;
    const { start_time, end_time, start_latitude, start_longitude, end_latitude, end_longitude, distance } = req.body;

    const newJourney = new Journey({
      user_id,
      start_time,
      end_time,
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude,
      distance
    });

    // Lưu hành trình vào MongoDB
    await newJourney.save();

    res.status(201).json(newJourney);  // Trả về dữ liệu hành trình vừa thêm
  } catch (error) {
    console.error("Error saving journey data:", error);
    res.status(500).json({ error: "Failed to save journey data" });
  }
});

//2. Lấy tất cả journey của một người dùng
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const journeys = await Journey.find({ user_id: userId });

    if (!journeys) {
      return res.status(404).json({ message: "No journeys found for this user" });
    }

    res.status(200).json(journeys);
  } catch (error) {
    console.error("Error fetching journey data:", error);
    res.status(500).json({ error: "Failed to fetch journey data" });
  }
});


//3. Lấy journey của người dùng hiện tại
router.get("/current_user", auth, async (req, res) => {
    const id = req.user.id;
  
    try {
      const journeys = await Journey.find({ user_id: id });
  
      if (journeys.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy hành trình nào của người dùng này" });
      }
  
      res.json({
        journeys: journeys,
      });
    } catch (error) {
      console.error("Lỗi khi lấy hành trình của người dùng:", error);
      res.status(500).json({ error: "Lỗi khi lấy dữ liệu hành trình" });
    }
  });


//4. Xóa nội dung của journeys
router.delete("/delete_all", auth, async (req, res) => {
  try {
    const user_id = req.user.id;  // Lấy ID người dùng từ thông tin xác thực

    // Xóa tất cả hành trình của người dùng này
    const result = await Journey.deleteMany({ user_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy hành trình nào để xóa" });
    }

    res.status(200).json({ message: "Đã xóa tất cả hành trình của người dùng" });
  } catch (error) {
    console.error("Lỗi khi xóa hành trình:", error);
    res.status(500).json({ error: "Lỗi khi xóa dữ liệu hành trình" });
  }
});

  



export default router;