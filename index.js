const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const holeRoutes = require("./routes/holeRoutes");
const placeRoutes = require("./routes/placeRoutes");
const navigation = require("./routes/navigation");
const download = require("./routes/downloadmap");
const profile = require("./routes/userRoute");
const history = require("./routes/history");
const journeyRoutes = require("./routes/journey.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware để log khi có thiết bị kết nối

// Sử dụng route xác thực
app.use("/api/auth", authRoutes);
app.use("/api/hole", holeRoutes);
app.use("/api/search", placeRoutes);
app.use("/api/navigation", navigation);
app.use("/api/download-map", download);
app.use("/api/profile", profile);
app.use("/api/history", history);
app.use("/api/journey", journeyRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
