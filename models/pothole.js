const mongoose = require("mongoose");

const potholeSchema = new mongoose.Schema({
  latitude: { type: Number, required: false, default: null },  // Không bắt buộc
  longitude: { type: Number, required: false, default: null }, // Không bắt buộc
  type: { type: String, required: false, default: null },      // Không bắt buộc
  state: { type: String, required: false, default: null },     // Không bắt buộc
  img: { type: String, required: false, default: null },       // Không bắt buộc
  journey_id: { type: String, required: false, default: null }, // Không bắt buộc
  author: { type: String, required: false, default: null },    // Không bắt buộc
  created_at: { type: Date, default: Date.now }, 
  updated_at: { type: Date, default: Date.now },  
});

// Hook tự động cập nhật `updated_at` khi chỉnh sửa bản ghi
potholeSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Tạo model Pothole từ schema
const Pothole = mongoose.model("Pothole", potholeSchema, "new_potholes");

module.exports = { Pothole };
