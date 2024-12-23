const express = require("express");
const { Pothole } = require("../models/pothole");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
router.get("/add", authenticateToken, async (req, res) => {
  try {
    const locations = await Pothole.find();
    res.json(locations);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, type, author, date } = req.body;
    const newHole = new Pothole({ latitude, longitude, type, author, date });
    const hole = Pothole.find();
    console.log("" + newHole);
    if (
      newHole.latitude == hole.latitude &&
      newHole.longitude == hole.longitude
    ) {
      res.status(400).send();
    }
    await newHole.save();
    res.status(201).send();
  } catch (error) {
    console.error("Error saving bump data:", error);
    res.status(500).json({ error: "Failed to save bump data" });
  }
});

router.get("/person", async (req, res) => {
  const username = req.query.username;
  try {
    // Find potholes by user authorId (author is assumed to be the user ID)
    const userPotholes = await Pothole.find({ author: username });

    if (userPotholes.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy ổ gà nào của người dùng này" });
    }
    res.json(userPotholes);
  } catch (error) {
    console.error("Failed to fetch user potholes:", error);
    res.status(500).json({ error: "Failed to fetch user potholes" });
  }
});
module.exports = router;
