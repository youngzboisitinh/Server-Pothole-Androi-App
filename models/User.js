const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
});

const userGoogleSchema = new mongoose.Schema ({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  picture : {type: String},},
  {versionkey : false});

// Mã hóa mật khẩu trước khi lưu
/*userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Chỉ mã hóa nếu mật khẩu đã thay đổi
  this.password = await bcrypt.hash(password, 10);
  next();
});*/
// Phương thức xác thực mật khẩu
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password,this.password);
};

const User = mongoose.model('User', userSchema);
const UserGoogle = mongoose.model('UserGoogle', userGoogleSchema);

module.exports = {User , UserGoogle};
