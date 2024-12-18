const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDirectory = "uploads/";

// Kiểm tra và tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory); // Thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file tối đa là 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.includes("image")) {
      return cb(new Error("Chỉ cho phép file hình ảnh (png, jpg, jpeg)."), false);
    }
    cb(null, true);
  }
});

// Middleware xử lý upload file
app.post('/new_user/upload', upload.single('image'), (req, res) => {
  res.send('File uploaded successfully');
}, (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).send("An Error occurs.");
  } else {
    return res.status(500).send(err.message); // Lỗi từ fileFilter hoặc lỗi khác
  }
});




