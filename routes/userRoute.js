const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { User } = require("../models/User");
const { Pothole } = require("../models/pothole");
// Cấu hình Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục lưu trữ ảnh
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.random().toString(36).substr(2, 9) +
        path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = file.mimetype.startsWith("image/");

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images with jpeg, jpg, png, gif are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Cập nhật thông tin người dùng
router.put("/update", upload.single("image"), async (req, res) => {
  try {
    const { email } = req.query;
    const { membertype, name, address, sex, bio, birthday, phone, since } =
      req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Tạo đối tượng cập nhật
    const updates = {};
    if (name) updates.nickname = name;
    if (address) updates.address = address;
    if (phone) updates.phoneNumber = phone;
    if (sex) updates.sex = sex;
    if (bio) updates.bio = bio;
    if (birthday) updates.dateOfBirth = birthday;
    if (since) updates.since = since;
    if (membertype) updates.membertype = membertype;

    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    // Lưu người dùng
    await user.save();

    // Phản hồi thành công
    res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công!",
      updatedFields: updates,
      user,
    });
  } catch (error) {
    console.error("Error updating user info:", error.message);
    res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
  }
});

// Lấy thông tin người dùng
router.get("/get", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const username = user.username;
    const userPotholes = await Pothole.find({ author: username });

    // Tính số ngày đã tham gia
    const sinceDate = new Date(user.since);
    const currentDate = new Date();
    const daysJoined = Math.ceil(
      (currentDate - sinceDate) / (1000 * 60 * 60 * 24)
    );

    let rank = "bronze";
    if (daysJoined > 180 && userPotholes.length > 50) {
      rank = "gold";
    } else if (daysJoined >= 30 && userPotholes.length >= 10) {
      rank = "silver";
    }

    const imagePath = user.profilePicture
      ? `${req.protocol}://${req.get("host")}/${user.profilePicture}`
      : null;

    res.status(200).json({
      membertype: rank,
      name: user.nickname,
      birthday: user.dateOfBirth,
      address: user.address,
      bio: user.bio,
      since: user.since,
      sex: user.sex,
      phone: user.phoneNumber,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
