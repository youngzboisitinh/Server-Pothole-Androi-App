const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const authRoutes = require("./routes/auth");
const holeRoutes = require("./routes/holeRoutes");
const userRoutes = require("./routes/user");
const journeyRoutes = require("./routes/journey");
const path = require('path');  // Thêm dòng này để import module path


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// API lấy nội dung tất cả collection trong database
app.get('/api/database', async (req, res) => {
  try {
    // Lấy danh sách tất cả collection
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Tạo object chứa dữ liệu từ từng collection
    const databaseContent = {};
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db.collection(collectionName).find().toArray();
      databaseContent[collectionName] = data;
    }

    res.status(200).json(databaseContent); // Trả về toàn bộ nội dung DB
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy dữ liệu từ database' });
  }
});

// API lấy danh sách tên collection và 2 dòng dữ liệu đầu tiên từ mỗi collection
app.get('/api/collections', async (req, res) => {
  try {
    // Lấy danh sách các collection
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Kết quả trả về
    const result = [];

    // Duyệt qua từng collection
    for (const collection of collections) {
      const collectionName = collection.name;

      // Lấy 2 dòng dữ liệu đầu tiên từ collection
      const data = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .limit(2)
        .toArray();

      // Chỉ lưu tên collection và dữ liệu
      result.push({
        collectionName,
        data,
      });
    }

    res.status(200).json(result); // Trả về kết quả dưới dạng danh sách
  } catch (err) {
    console.error('Lỗi:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy dữ liệu từ database' });
  }
});


// Cấu hình Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Phiên bản OpenAPI
    info: {
      title: "Pothole App API Documentation", // Tiêu đề tài liệu API
      version: "1.0.0", // Phiên bản API
      description: "This is the API documentation for the application",
    },
  },
  apis: ["./routes/*.js"], // Đường dẫn tới các file chứa các API route
};

// Tạo tài liệu Swagger từ các định nghĩa trên
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Sử dụng Swagger UI để hiển thị tài liệu
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

// Middleware để log khi có thiết bị kết nối
app.use((req, res, next) => {
  console.log(
    `Thiết bị kết nối từ IP: ${
      req.ip
    } - Thời gian: ${new Date().toLocaleString()}`
  );
  next();
});

// Sử dụng route xác thực
app.use("/api/auth", authRoutes);
app.use("/api/hole", holeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/journey", journeyRoutes );
// Middleware để phục vụ ảnh tĩnh từ thư mục 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
