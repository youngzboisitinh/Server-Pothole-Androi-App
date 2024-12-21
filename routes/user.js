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

// API để lấy ảnh đại diện của người dùng


router.get('/profile-picture/:userId', async (req, res) => {
    const userId = req.params.userId;  // Lấy userId từ tham số URL
    const __dirname = import.meta.dirname;
    let  uploadDir = path.resolve(__dirname, '..', 'uploads');



    console.log("Day la uploadDir " + uploadDir);

    try {
        // Đọc tất cả các tệp trong thư mục uploads
        const files = await fsPromises.readdir(uploadDir);
        
        // Tìm tệp có tên bắt đầu với userId (và bất kỳ đuôi file nào)
        const matchingFile = files.find(file => file.startsWith(userId) && file.includes('.'));
        
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


// Kiểm tra và tạo thư mục nếu chưa tồn tại
const uploadDirectory = 'uploads/';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Thiết lập Multer để upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory); // Thư mục lưu file
    },
    filename: (req, file, cb) => {
        // Lấy id của user từ middleware auth (thông thường được thêm vào req.user)
        const userId = req.user.id; // 'req.user' được set trong middleware auth
        if (!userId) {
            return cb(new Error('User ID not found in request'), null);
        }

        // Tạo tên file với định dạng: <userId>.extension
        const fileName = `${userId}${path.extname(file.originalname)}`;
        cb(null, fileName);
    },
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file (5MB)
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (JPEG, JPG, PNG)'));
        }
    },
});

//1. Cập nhật thông tin cho new user
router.post('/new_user/update', auth, upload.single('profilePicture'), updateNewUser);

/**
 * @swagger
 * paths:
 *   /api/user/info:
 *     get:
 *       summary: "Lấy thông tin người dùng"
 *       tags: [User]
 *       description: "API để lấy thông tin chi tiết của người dùng hiện tại"
 *       security:
 *         - bearerAuth: []  # Xác thực bằng token
 *       responses:
 *         200:
 *           description: "Thông tin người dùng"
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345"
 *                     description: "ID người dùng"
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                     description: "Email của người dùng"
 *                   name:
 *                     type: string
 *                     example: "Nguyễn Văn A"
 *                     description: "Tên người dùng"
 *                   profilePicture:
 *                     type: string
 *                     example: "uploads/1622551267890-image.jpg"
 *                     description: "URL ảnh đại diện của người dùng"
 *                   isVerified:
 *                     type: boolean
 *                     example: true
 *                     description: "Trạng thái xác minh email của người dùng"
 *                   role:
 *                     type: string
 *                     example: "admin"
 *                     description: "Vai trò của người dùng trong hệ thống"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-01T12:34:56Z"
 *                     description: "Thời gian người dùng đăng ký tài khoản"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-01-01T12:34:56Z"
 *                     description: "Thời gian tài khoản được cập nhật lần cuối"
 *                   sex:
 *                     type: string
 *                     example: "Male"
 *                     description: "Giới tính của người dùng"
 *                   bio:
 *                     type: string
 *                     example: "Đây là tiểu sử của người dùng"
 *                     description: "Tiểu sử ngắn gọn của người dùng"
 *                   birthday:
 *                     type: string
 *                     example: "1990-01-01"
 *                     description: "Ngày sinh của người dùng"
 *                   phoneNumber:
 *                     type: string
 *                     example: "0987654321"
 *                     description: "Số điện thoại của người dùng"
 *                   score:
 *                     type: number
 *                     example: 100
 *                     description: "Điểm của người dùng trong hệ thống"
 *                   isFirstLogin:
 *                     type: boolean
 *                     example: true
 *                     description: "Trạng thái lần đăng nhập đầu tiên của người dùng"
 *         401:
 *           description: "Không có quyền truy cập, vui lòng đăng nhập lại"
 *         404:
 *           description: "Không tìm thấy người dùng"
 *         500:
 *           description: "Lỗi server"
 */

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