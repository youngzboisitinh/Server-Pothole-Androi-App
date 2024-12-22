//const mongoose = require("mongoose");
//const bcrypt = require("bcryptjs");

import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
  id: { type: String },                  // ID người dùng (từ HEAD)
  username: { type: String, unique: true },  // Tên người dùng (từ nhánh AnhNguyen)
  email: { type: String, required: true, unique: true },  // Email người dùng
  password: { type: String },            // Mật khẩu người dùng
  message: { type: String },             // Thông điệp phản hồi (từ HEAD)
  status: { type: String, enum: ["online", "offline"], default: "offline" }, // Trạng thái online/offline (từ nhánh AnhNguyen)
  isVerified: { type: Boolean, default: false },  // Trạng thái xác minh email
  verificationCode: { type: String },    // Mã xác thực
  verificationCodeExpires: { type: Date }, // Thời gian hết hạn mã xác thực
  nickname: { type: String },            // Biệt danh người dùng (từ nhánh AnhNguyen)
  address: { type: String },             // Địa chỉ người dùng (từ nhánh AnhNguyen)
  phoneNumber: { type: String },         // Số điện thoại người dùng
  sex: { type: String },                 // Giới tính người dùng
  bio: { type: String },                 // Tiểu sử người dùng
  dateOfBirth: { type: String },         // Ngày sinh người dùng (từ nhánh AnhNguyen)
  profilePicture: { type: String },      // URL ảnh đại diện
  since: { type: String },
  createdAt: { type: Date, default: Date.now }, // Thời gian tạo tài khoản
  updatedAt: { type: Date, default: Date.now }, // Thời gian cập nhật tài khoản
  score: { type: Number, default: 0 },   // Điểm người dùng (từ HEAD)
  isFirstLogin: { type: Boolean, default: true } // Trạng thái lần đăng nhập đầu tiên (từ HEAD)
});

// Phương thức xác thực mật khẩu
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Cập nhật thời gian cập nhật tài khoản khi có thay đổi
userSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

const User = mongoose.model("User", userSchema);

export {User};
