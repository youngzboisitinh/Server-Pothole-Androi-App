const axios = require("axios");
const express = require("express");
const router = express.Router();

const isValidCoordinates = (coord) => {
  const regex = /^-?\d+(\.\d{1,})?,-?\d+(\.\d{1,})?$/;
  return regex.test(coord);
};

router.get("/", async (req, res) => {
  const start = req.query.start;
  const destination = req.query.destination;
  console.log(start + " " + destination);
  if (!start || !destination) {
    // Sử dụng destination thay cho end
    return res
      .status(400)
      .send("Vui lòng cung cấp điểm bắt đầu và điểm kết thúc");
  }

  // Kiểm tra tính hợp lệ của tọa độ
  if (!isValidCoordinates(start) || !isValidCoordinates(destination)) {
    return res
      .status(400)
      .send(
        "Tọa độ không hợp lệ. Vui lòng cung cấp định dạng latitude,longitude"
      );
  }

  try {
    // Gọi API của OSRM với tọa độ start và destination
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${start};${destination}?overview=full&geometries=geojson`;
    console.log("Calling OSRM API with URL:", osrmUrl);

    const response = await axios.get(osrmUrl);

    // Lấy tọa độ từ response
    const coordinates = response.data.routes[0].geometry.coordinates;

    // Duyệt qua tất cả tọa độ và xử lý
    const extractedCoordinates = coordinates.map((coordinate, index) => {
      const longitude = coordinate[0];
      const latitude = coordinate[1];
      return { longitude, latitude }; // Lưu vào một đối tượng hoặc thực hiện tính toán khác
    });

    // Gửi tọa độ đã xử lý về client
    res.json({
      status: "success",
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
