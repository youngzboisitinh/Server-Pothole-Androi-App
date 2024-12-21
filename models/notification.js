// Import các module cần thiết
import mongoose from "mongoose";

// Định nghĩa schema cho thông báo
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ID người dùng
  potholeId: { type: String, required: true }, // ID ổ gà
  status: { type: String, required: true }, // 'accepted' hoặc 'rejected'
  reason: { type: String }, // Lý do nếu bị từ chối
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model Notification
const Notification = mongoose.model("Notification", NotificationSchema);

// Export model để sử dụng ở nơi khác
export default Notification;
