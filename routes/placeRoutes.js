const express = require("express");
const router = express.Router();
const Place = require("../models/PlaceFeature");

router.get("/", async (req, res) => {
  const keyword = req.query.keyword?.trim();
  const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
  const limit = parseInt(req.query.limit) || 10; // Số kết quả trên mỗi trang, mặc định là 10

  if (!keyword) {
    return res.status(400).json({ message: "Keyword is required" });
  }

  try {
    // Tạo regex tìm kiếm bất kỳ phần nào trong từ khóa
    // Thêm .* để tìm kiếm bất kỳ từ nào chứa ký tự nhập vào, từ đầu đến cuối
    const regex = new RegExp(keyword.split(" ").join(".*"), "i");

    const places = await Place.aggregate([
      { $unwind: "$features" }, // Bóc tách từng phần tử trong mảng `features`
      {
        $match: {
          $or: [
            { "features.properties.name": { $regex: regex } },
            { "features.properties.amenity": { $regex: regex } },
            { "features.properties.category": { $regex: regex } },
            { "features.properties.brand": { $regex: regex } },
            { "features.properties.operator": { $regex: regex } },
          ],
        },
      },
      {
        $project: {
          _id: 0, // Bỏ _id trong kết quả trả về
          name: "$features.properties.name",
          amenity: "$features.properties.amenity",
          latitude: { $arrayElemAt: ["$features.geometry.coordinates", 1] },
          longitude: { $arrayElemAt: ["$features.geometry.coordinates", 0] },
          operator: "$features.properties.operator",
        },
      },
      { $skip: (page - 1) * limit }, // Bỏ qua các mục để lấy trang hiện tại
      { $limit: limit }, // Giới hạn số mục trả về
    ]);

    if (places.length === 0) {
      return res
        .status(404)
        .json({ message: "No places found matching the keyword" });
    }

    res.json({ message: "Search results", page, places });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ message: "Error fetching places", error });
  }
});

module.exports = router;
