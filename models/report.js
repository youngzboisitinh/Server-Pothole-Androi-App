import mongoose from 'mongoose';

// Định nghĩa schema cho report
const reportSchema = new mongoose.Schema({
  author: { type: String, required: false }, // ID của người dùng, bắt buộc
  potholeId: { type: String, required: false }, // ID của ổ gà, bắt buộc
  reason: { type: String, required: false }, // Lý do báo cáo, bắt buộc
  state: { type: String, required: false, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Trạng thái báo cáo
  createdAt: { type: Date, default: Date.now }, // Thời điểm tạo báo cáo
  updatedAt: { type: Date, default: Date.now }, // Thời điểm cập nhật báo cáo
});

// Hook để tự động cập nhật `updatedAt` khi chỉnh sửa
reportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Tạo model Report từ schema
const Report = mongoose.model('Report', reportSchema);

export { Report };
