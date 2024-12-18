const express = require("express");
const { Pothole } = require("../models/pothole");
const auth = require("../middleware/auth");
const router = express.Router();

//1. Lấy tất cả các ổ gà
router.get("/all", async (req, res) => {
  try {
    const potholes = await Pothole.find(); //trỏ tới new_potholes
    res.json(potholes);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

//2. Thêm ổ gà mới

/**
 * @swagger
 * /api/hole/add:
 *   post:
 *     summary: Thêm một ổ gà mới
 *     tags: [Pothole]
 *     description: Thêm một ổ gà mới vào cơ sở dữ liệu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 21.0285
 *                 description: Vĩ độ của ổ gà
 *               longitude:
 *                 type: number
 *                 example: 105.8542
 *                 description: Kinh độ của ổ gà
 *               type:
 *                 type: string
 *                 example: "caution"
 *                 description: "Caution, Warning, Danger"
 *               state:
 *                 type: string
 *                 example: "Pending"
 *                 description: "'Accept', 'Pending', 'Reject'"
 *               author:
 *                 type: string
 *                 example: "Người dùng A"
 *                 description: Id của người dùng phát hiện ổ gà
 *               img:
 *                 type: string
 *                 example: "https://example.com/path/to/image.jpg"
 *                 description: "Đường dẫn đến ảnh của ổ gà"
 *     responses:
 *       201:
 *         description: Ổ gà được tạo thành công
 *       400:
 *         description: Thông tin không hợp lệ hoặc ổ gà đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ổ gà đã tồn tại"
 *       500:
 *         description: Lỗi khi lưu dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to save bump data"
 */
router.post("/add", auth, async (req, res) => {
  try {
    const author = req.user.id;
    const { latitude, longitude, type, state, journey_id, img } = req.body;
    
    const existingPothole = await Pothole.findOne({ latitude, longitude });
    if (existingPothole) {
      return res.status(400).json({ error: "Ổ gà đã tồn tại" });
    }

    const newPothole = new Pothole({
      latitude,
      longitude,
      type,
      state, 
      journey_id,
      author, 
      img, 
    });

    await newPothole.save();
    res.status(201).json(newPothole); 

  } catch (error) {
    console.error("Error saving bump data:", error);
    res.status(500).json({ error: "Failed to save bump data" });
  }
});

// 3. Lấy ổ gà theo id người dùng (author)
router.get("/user/:authorId", async (req, res) => {
  const { authorId } = req.params;

  try {
    // Find potholes by user authorId (author is assumed to be the user ID)
    const userPotholes = await Pothole.find({ author: authorId });

    if (userPotholes.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà nào của người dùng này" });
    }

    res.json(userPotholes);
  } catch (error) {
    console.error("Failed to fetch user potholes:", error);
    res.status(500).json({ error: "Failed to fetch user potholes" });
  }
});

// 4. Cập nhật ổ gà theo user_id và pothole_id
router.put("/update/:userId/:potholeId", async (req, res) => {
  const { userId, potholeId } = req.params;
  const { latitude, longitude, type, state, journey_id, author, img } = req.body;

  try {

    const pothole = await Pothole.findOne({ _id: potholeId, author: userId });

    if (!pothole) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà hoặc người dùng không có quyền sửa ổ gà này" });
    }


    if (latitude) pothole.latitude = latitude;
    if (longitude) pothole.longitude = longitude;
    if (type) pothole.type = type;
    if (state) pothole.state = state;
    if (journey_id) pothole.journey_id = journey_id;
    if (author) pothole.author = author;
    if (img) pothole.img = img;

  
    await pothole.save();

    res.json({ message: "Cập nhật ổ gà thành công", pothole });
  } catch (error) {
    console.error("Error updating pothole:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật ổ gà" });
  }
});

//5. Lấy ổ gà của người dùng hiện tại (dựa trên token)
router.get("/current_user", auth, async (req, res) => {
  const id = req.user.id;

  console.log("day la token trong pothole", id)

  try {
    const userPotholes = await Pothole.find({ author: id });

    if (userPotholes.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy ổ gà nào của người dùng này" });
    }

    res.json({
      potholes: userPotholes,
    });
  } catch (error) {
    console.error("Lỗi khi lấy ổ gà của người dùng:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu ổ gà" });
  }
});

//6. Xóa toàn bộ nội dung trong bảng pothole
router.delete("/delete_all", async (req, res) => {
  try {
    // Xóa tất cả các bản ghi trong bảng pothole
    await Pothole.deleteMany({});

    res.status(200).json({ message: "Đã xóa tất cả các ổ gà" });
  } catch (error) {
    console.error("Error clearing all potholes:", error);
    res.status(500).json({ error: "Lỗi khi xóa tất cả ổ gà" });
  }
});




module.exports = router;
