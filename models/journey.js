const mongoose = require("mongoose");

//import mongoose from 'mongoose';

// Định nghĩa schema với các trường linh hoạt
const journeySchema = new mongoose.Schema({
  username: { type: String, required: true }, // Trường bắt buộc
  start_time: { type: Date, required: false, default: null }, // Không bắt buộc
  end_time: { type: Date, required: false, default: null }, // Không bắt buộc
  start_latitude: { type: Number, required: false, default: null }, // Không bắt buộc
  start_longitude: { type: Number, required: false, default: null }, // Không bắt buộc
  end_latitude: { type: Number, required: false, default: null }, // Không bắt buộc
  end_longitude: { type: Number, required: false, default: null }, // Không bắt buộc
  distance: { type: Number, required: false, default: null }, // Khoảng cách, không bắt buộc
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Hook tự động cập nhật `updated_at` khi chỉnh sửa
journeySchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Tạo model Journey từ schema
const Journey = mongoose.model("Journey", journeySchema);

module.exports = { Journey };
