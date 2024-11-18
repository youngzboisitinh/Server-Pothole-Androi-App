const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true, // Tạo chỉ mục để tìm kiếm tên nhanh hơn
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [Kinh độ, Vĩ độ]
        required: true,
        index: "2dsphere", // Tạo chỉ mục địa lý cho tìm kiếm không gian
      },
    },
    category: {
      type: String,
      enum: ["atm", "restaurant", "park", "hotel", "shop"], // Các loại địa điểm phổ biến
      required: true,
    },
    amenities: [String], // Danh sách các tiện ích đi kèm (nếu có)
    opening_hours: String, // Giờ mở cửa, ví dụ "24/7" hoặc "10:00-22:00"
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    operator: String, // Tên của tổ chức điều hành (nếu có)
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    contact: {
      phone: String,
      website: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("place", placeSchema);
