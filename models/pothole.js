//const mongoose = require("mongoose");

// eventEmitter.js
import { EventEmitter } from 'events';
import mongoose from 'mongoose';

const potholeEventEmitter = new EventEmitter();

const potholeSchema = new mongoose.Schema({
  latitude: { type: Number, required: false, default: null },  // Không bắt buộc
  longitude: { type: Number, required: false, default: null }, // Không bắt buộc
  type: { type: String, required: false, default: null },      // Không bắt buộc
  date: { type: String, required: false, default: null },  
  author: { type: String, required: false, default: null },    // Không bắt buộc



  state: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    required: false, 
    default: 'pending', 
  },
  img: { type: String, required: false, default: null },       // Không bắt buộc
  journey_id: { type: String, required: false, default: null }, // Không bắt buộc  
  created_at: { type: Date, default: Date.now }, 
  updated_at: { type: Date, default: Date.now },
  rejection_reason: { type: String, required: false, default: null }    // Không bắt buộc (từ nhánh kia)
});

// Hook tự động cập nhật `updated_at` khi chỉnh sửa bản ghi
potholeSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});



// Đăng ký sự kiện potholeUpdated để phát thông báo khi có thay đổi
potholeEventEmitter.on('potholeUpdated', (pothole) => {
  console.log('Pothole đã được cập nhật:', pothole);
  sendNotification(pothole);
});

// Hook `post` khi bản ghi được lưu thành công
potholeSchema.post('save', function (doc) {
  // Kiểm tra nếu có thay đổi về state hoặc rejection_reason
  if (doc.isModified('state') || doc.isModified('rejection_reason')) {
    console.log('Bản ghi đã được thay đổi, phát sự kiện potholeUpdated');
    // Phát sự kiện khi có thay đổi
    potholeEventEmitter.emit('potholeUpdated', doc);
  }
});

// Tạo model Pothole từ schema
const Pothole = mongoose.model('Pothole', potholeSchema);

export { Pothole, potholeEventEmitter };