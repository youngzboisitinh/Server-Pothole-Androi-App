const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const holeRoutes = require("./routes/holeRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
