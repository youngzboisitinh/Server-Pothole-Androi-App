const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// API Đăng ký
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Tài khoản đã tồn tại!" });

    const token = jwt.sign(
      { username, email, password },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationLink = `https://server-pothole-androi-app.onrender.com/api/auth/verify-email?token=${token}`;
    const newUser = new User({ email, isVerified: false });
    await newUser.save();
    // Gửi email xác minh với link chứa token
    const transporter = createTransporter();
    await transporter.sendMail({
      to: email,
      subject: "Xác nhận tài khoản của bạn",
      html: `<p>Nhấn vào liên kết sau để xác minh email của bạn: <a href="${verificationLink}">Xác minh Email</a></p>`,
    });

    res.status(201).json({
      message: "Vui lòng kiểm tra email để xác minh tài khoản.",
      email,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server." });
  }
});

router.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "Token không hợp lệ" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, email, password } = decoded;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác thực." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { username, email, password: hashedPassword, isVerified: true },
      { new: true }
    );

    res.json({ message: "Tài khoản của bạn đã được xác thực thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xác thực tài khoản" });
  }
});

// API kiểm tra trạng thái xác thực
router.get("/check-verification-status", async (req, res) => {
  const email = req.query;
  try {
    const user = await User.findOne(email);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra trạng thái" });
  }
});

// Đăng nhập và tạo JWT token
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const em = user.email;
    if (!user)
      return res
        .status(400)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });

    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });

    // Cập nhật trạng thái người dùng thành 'online'
    user.status = "online";
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      message: "Đăng nhập thành công!",
      em,
    });
  } catch (error) {
    console.error(error); // In lỗi ra console
    res.status(500).json({ message: "Lỗi server." });
  }
});

// Tạo transporter một lần
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Route gửi mã xác nhận
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 1 * 60 * 1000; // Hết hạn sau 1 phút
    await user.save();

    const transporter = createTransporter();
    await transporter.sendMail({
      to: email,
      subject: "Mã xác nhận đặt lại mật khẩu",
      html: `<p>Mã xác nhận của bạn là: <strong>${verificationCode}</strong></p>`,
    });

    res.json({ message: "Đã gửi mã xác nhận qua email" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi, vui lòng thử lại" });
  }
});

// Route xác nhận mã
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ" });

    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Mã xác nhận đã hết hạn" });
    }

    res.json({ message: "Mã xác nhận hợp lệ" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi, vui lòng thử lại." });
  }
});

// Route đổi mật khẩu
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Băm mật khẩu mới

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Xóa mã xác nhận và thời gian hết hạn
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save(); // Lưu thay đổi vào cơ sở dữ liệu

    res.json({ message: "Mật khẩu đã được thay đổi." });
  } catch (error) {
    console.error(error); // In lỗi ra console
    res.status(500).json({ message: "Lỗi, vui lòng thử lại." });
  }
});

router.post("/logout", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.status = "offline";
    await user.save();

    res.json({ message: "Đăng xuất thành công", status: user.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi đăng xuất, vui lòng thử lại." });
  }
});
//Đăng nhập Google
// router.post('/google-login', async (req, res) => {
//   const { idToken } = req.body;

//   try {
//     // Xác minh ID token với Google
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();

//     const { email, name, picture } = payload;

//     // Kiểm tra xem người dùng đã tồn tại trong hệ thống chưa
//     let user = await UserGoogle.findOne({ email });
//     if (!user) {
//       // Nếu chưa tồn tại, tạo tài khoản mới
//       user = new UserGoogle({ username: name, email, profileImage: picture });
//       await user.save();
//     }

//     // Tạo JWT token cho người dùng
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ message: 'Đăng nhập bằng Google thành công!', token });
//   } catch (error) {
//     console.error('Google login error:', error);
//     res.status(500).json({ message: 'Lỗi xác thực Google.' });
//   }
// });

module.exports = router;
