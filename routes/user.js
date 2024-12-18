const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const fs = require('fs');
const auth = require('../middleware/auth');


const router = express.Router();

// API để lấy ảnh đại diện của người dùng
router.get('/profile-picture/:userId', (req, res) => {
    const userId = req.params.userId;  // Lấy userId từ tham số URL
    const profilePicturePath = path.join(__dirname, '..', 'uploads', `${userId}.jpg`);  // Đường dẫn tới ảnh trong thư mục uploads

    // Kiểm tra xem file ảnh có tồn tại hay không
    fs.exists(profilePicturePath, (exists) => {
        if (exists) {
            // Nếu ảnh tồn tại, trả về ảnh
            res.sendFile(profilePicturePath);
        } else {
            // Nếu ảnh không tồn tại, trả về lỗi 404
            res.status(404).send('Profile picture not found');
        }
    });
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
router.post('/new_user/update', auth, upload.single('profilePicture'), userController.updateNewUser);

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

router.put('/update', auth, upload.single('profilePicture'), userController.updateUser);


//4. Lấy thông tin user hiện tại
router.get('/info', auth, userController.getUserInfo);
//5. Lấy thông tin user theo username
router.get('/info/:username', auth, userController.getUserInfoByUsername);
//6. Lấy tất cả người dùng
router.get('/all_users', auth, userController.getAllUsers );


module.exports = router;
