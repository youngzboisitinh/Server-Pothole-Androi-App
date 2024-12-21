

  /*
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

const payload = require('payload');


//AnhNguyen
const placeRoutes = require("./routes/placeRoutes");
const navigation = require("./routes/navigation");
const download = require("./routes/downloadmap");
const profile = require("./routes/userRoute"); */

import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import authRoutes from "./routes/auth.js";
import holeRoutes from "./routes/holeRoutes.js";
import userRoutes from "./routes/user.js";
import journeyRoutes from "./routes/journey.js";
import imageRoutes from "./routes/image.js";
import reportRoutes from "./routes/report.js";
import notificationRoutes from "./routes/notification.js";
import { Pothole } from "./models/pothole.js";
import path from "path"; // Đã thay đổi từ require thành import

//import payload from 'payload'; // Đổi từ require sang import

//AnhNguyen
import placeRoutes from "./routes/placeRoutes.js";
import navigation from "./routes/navigation.js";
import download from "./routes/downloadmap.js";
import profile from "./routes/userRoute.js";




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

app.use(cors({
    origin: '*', // Hoặc thay bằng URL frontend của bạn
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));


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
app.use("/api/img/uploads", imageRoutes);
app.use("/api/report", reportRoutes);
// Middleware để phục vụ ảnh tĩnh từ thư mục 'uploads'
// Middleware để phục vụ ảnh tĩnh từ thư mục 'uploads'
const __dirname = import.meta.dirname;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/search", placeRoutes);
app.use("/api/navigation", navigation);
app.use("/api/download-map", download);
app.use("/api/profile", profile);
app.use("/api/notification", notificationRoutes);








// Hàm lấy thông tin người dùng từ cơ sở dữ liệu (giả sử sử dụng Sequelize)
async function getUserById(userId) {
  return await User.findByPk(userId); // Dùng ORM hoặc truy vấn cơ sở dữ liệu
}


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));



/*
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); */




const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn (dành cho test)
  },
});

// Khi client kết nối
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Client yêu cầu theo dõi potholeId
  socket.on("watch_pothole_status", (potholeId) => {
    console.log(`Client ${socket.id} is watching pothole ${potholeId}`);
    
    // Kết nối WebSocket với database hoặc mô phỏng sự thay đổi
    setInterval(async () => {
      // Lấy trạng thái mới nhất từ database (ví dụ bằng Mongoose)
      const pothole = await Pothole.findById(potholeId);
      if (!pothole) return;

      // Trả về trạng thái cập nhật
      socket.emit("status_update", {
        potholeId: potholeId,
        status: pothole.state,
        reason: pothole.rejection_reason || null,
      });
    }, 5000); // Giả lập kiểm tra mỗi 5 giây
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


// Chạy server
server.listen(3000, () => {
  console.log("WebSocket server is running on http://localhost:3000");
});

