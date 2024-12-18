const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  id: { type: String },                  // ID người dùng
  message: { type: String },             // Thông điệp phản hồi
  email: { type: String, required: true, unique: true },  // Email người dùng
  name: { type: String },                // Tên người dùng
  profilePicture: { type: String },      // URL ảnh đại diện
  token: { type: String },               // Token xác thực
  isVerified: { type: Boolean, default: false },          // Trạng thái xác minh email
  role: { type: String },                // Vai trò người dùng
  createdAt: { type: Date, default: Date.now },           // Thời gian tạo tài khoản
  updatedAt: { type: Date, default: Date.now },           // Thời gian cập nhật tài khoản
  sex: { type: String },                 // Giới tính người dùng
  bio: { type: String },                 // Tiểu sử người dùng
  birthday: { type: String },            // Ngày sinh người dùng
  phoneNumber: { type: String },         // Số điện thoại người dùng
  score: { type: Number, default: 0 },   // Điểm người dùng
  isFirstLogin: { type: Boolean, default: true },         // Trạng thái lần đăng nhập đầu tiên
  password: { type: String },            // Mật khẩu người dùng (nếu có)
  verificationCode: { type: String },    // Mã xác thực
  verificationCodeExpires: { type: Date }, // Thời gian hết hạn mã xác thực
});

// Phương thức xác thực mật khẩu
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Cập nhật thời gian cập nhật tài khoản
userSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
