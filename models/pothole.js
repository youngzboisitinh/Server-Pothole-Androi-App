const mongoose = require("mongoose");

const potholeSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
});

const Pothole = mongoose.model("Pothole", potholeSchema);

module.exports = { Pothole };
