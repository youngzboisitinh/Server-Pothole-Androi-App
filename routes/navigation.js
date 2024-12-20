const axios = require("axios");
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

const isValidCoordinates = (coord) => {
  const regex = /^-?\d+(\.\d{1,})?,-?\d+(\.\d{1,})?$/;
  return regex.test(coord);
};
router.get("/", authenticateToken, async (req, res) => {
  const start = req.query.start;
  const destination = req.query.destination;
  if (!isValidCoordinates(start) || !isValidCoordinates(destination)) {
    return res
      .status(400)
      .send(
        "Tọa độ không hợp lệ. Vui lòng cung cấp định dạng latitude,longitude"
      );
  }

  try {
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${start};${destination}?overview=full&geometries=geojson`;
    const response = await axios.get(osrmUrl);
    const route = response.data.routes[0];
    const coordinates = route.geometry.coordinates;

    // Độ dài quãng đường (meters) và thời gian ước tính (seconds)
    const distance = route.distance; // Đơn vị: meters
    const duration = route.duration; // Đơn vị: seconds

    // Chuyển đổi toạ độ thành các đối tượng { longitude, latitude }
    const extractedCoordinates = coordinates.map((coordinate) => {
      const longitude = coordinate[0];
      const latitude = coordinate[1];
      return { longitude, latitude };
    });
    res.json({
      status: "success",
      distance,
      duration,
      coordinates: extractedCoordinates,
    });
  } catch (error) {
    console.error("Error fetching route from OSRM:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    res.status(500).send("Có lỗi xảy ra khi lấy chỉ đường từ OSRM");
  }
});

module.exports = router;
