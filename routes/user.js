/*const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const fs = require('fs');
const auth = require('../middleware/auth');
const fsPromises = require('fs').promises; // Sử dụng promises để dễ dàng xử lý bất đồng bộ

*/

import express from 'express';
import multer from 'multer';
import path from 'path';
import { updateUser, updateNewUser, getUserInfo, getUserInfoByUsername, getAllUsers } from '../controllers/userController.js'; 
import fs from 'fs';
import {auth} from '../middleware/auth.js';  // Thêm .js nếu cần
import fsPromises from 'fs/promises';  // Sử dụng promises để dễ dàng xử lý bất đồng bộ
import { User } from '../models/User.js';

const router = express.Router();

// Kiểm tra và tạo thư mục nếu chưa tồn tại
const uploadDirectory = 'uploads/';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}




// API để lấy ảnh đại diện của người dùng

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

    const imagePath = user.profilePicture
      ? `${req.protocol}://${req.get("host")}/${user.profilePicture}`
      : null;

    res.status(200).json({
      name: user.nickname,
      birthday: user.dateOfBirth,
      address: user.address,
      bio: user.bio,
      profilePicture: imagePath,
      since: user.since,
      sex: user.sex,
      phone: user.phoneNumber,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory); // Thư mục lưu file
    },
    filename: async (req, file, cb) => {
        // Lấy email từ query, body hoặc header
        const email = req.query.email || req.body.email || req.headers['email'];

        if (!email) {
            return cb(new Error('Email not found in request'), null);
        }

        try {
            // Tìm người dùng bằng phương thức findOne trong MongoDB
            const user = await User.findOne({ email: email });

            if (!user) {
                return cb(new Error('User not found'), null);
            }

            const username = user.username;

            if (!username) {
                return cb(new Error('Username not found for the given email'), null);
            }

            // Tạo tên file với định dạng: <username>.extension
            const fileName = `${username}${path.extname(file.originalname)}`;
            cb(null, fileName);
        } catch (err) {
            cb(new Error('Error fetching user data: ' + err.message), null);
        }
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file (5MB)
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/; // Định dạng file hợp lệ
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
    
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (JPEG, JPG, PNG)'), false);
        }
    },
});


// Cập nhật thông tin người dùng
router.put("/update", upload.single("image"), async (req, res) => {
  try {
    const { email } = req.query;
    const { username, name, address, sex, bio, birthday, phone, since } = req.body;

    // Tìm người dùng qua email
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.findOne({ username });  
    }
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại." });

    // Tạo đối tượng cập nhật
    const updates = {};
    if (name) updates.nickname = name;
    if (address) updates.address = address;
    if (phone) updates.phoneNumber = phone;
    if (sex) updates.sex = sex;
    if (bio) updates.bio = bio;
    if (birthday) updates.dateOfBirth = birthday;
    if (since) updates.since = since;

    // Xử lý ảnh (nếu có)
    if (req.file) {
      updates.profilePicture = req.file.path;
    }

    // Gán giá trị mới cho user (thêm trường nếu chưa tồn tại)
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


router.get('/profile-picture/:username', async (req, res) => {
    const username = req.params.username;  // Lấy userId từ tham số URL
    const __dirname = import.meta.dirname;
    let  uploadDir = path.resolve(__dirname, '..', 'uploads');



    console.log("Day la uploadDir " + uploadDir);

    try {
        // Đọc tất cả các tệp trong thư mục uploads
        const files = await fsPromises.readdir(uploadDir);
        
        // Tìm tệp có tên bắt đầu với userId (và bất kỳ đuôi file nào)
        const matchingFile = files.find(file => file.startsWith(username) && file.includes('.'));
        
        if (matchingFile) {
            // Nếu tìm thấy tệp phù hợp, trả về tệp ảnh
            const profilePicturePath = path.join(uploadDir, matchingFile);
            res.sendFile(profilePicturePath);
        } else {
            // Nếu không tìm thấy ảnh, trả về lỗi 404
            res.status(404).send('Profile picture not found');
        }
    } catch (error) {
        console.error(error); // In lỗi ra console
        res.status(500).send('Server error');
    }
});




//1. Cập nhật thông tin cho new user
router.post('/new_user/update', auth, upload.single('profilePicture'), updateNewUser);


router.put('/update', auth, upload.single('profilePicture'), updateUser);


//4. Lấy thông tin user hiện tại
router.get('/info', auth, getUserInfo);
//5. Lấy thông tin user theo username
router.get('/info/:username', auth, getUserInfoByUsername);
//6. Lấy tất cả người dùng
router.get('/all_users', auth, getAllUsers );

router.post('/update-score', auth, async (req, res) => {
    let { score } = req.body;

    const userId = req.user.id;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || score === undefined) {
        return res.status(400).send('Thiếu thông tin userId hoặc score');
    }

    // Chuyển score sang kiểu số nguyên
    score = parseInt(score, 10);

    if (isNaN(score)) {
        return res.status(400).send('Giá trị score không hợp lệ (phải là số nguyên)');
    }

    try {
        // Tìm người dùng trong MongoDB
        const user = await User.findById(userId).select('-password -verificationCode'); // Không trả về password và verificationCode

        if (!user) {
            return res.status(404).send('Không tìm thấy người dùng');
        }

        // Cập nhật điểm của người dùng
        user.score = (user.score || 0) + score; // Đảm bảo user.score luôn là số
        await user.save();

        res.status(200).send('Cập nhật điểm thành công');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});


// API lấy top 3 user cao điểm nhất
router.get('/top-scores', async (req, res) => {
    try {
        // Tìm top 3 người dùng có điểm cao nhất, chỉ lấy username và score
        const topUsers = await User.find()
            .sort({ score: -1 }) // Sắp xếp theo score giảm dần
            .limit(3)            // Lấy 3 người đầu tiên
            .select('username score profilePicture _id'); // Chỉ lấy username và score, không lấy _id

        res.status(200).json(topUsers); // Trả về danh sách top 3
    } catch (error) {
        console.error('Lỗi khi lấy top scores:', error);
        res.status(500).send('Lỗi server');
    }
});





export default router;