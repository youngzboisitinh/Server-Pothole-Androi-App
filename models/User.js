const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  nickname: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  since: { type: String },
  sex: { type: String },
  bio: { type: String },
  dateOfBirth: { type: String },
  profilePicture: { type: String },
});

// Phương thức xác thực mật khẩu
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
