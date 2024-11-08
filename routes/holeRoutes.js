const express = require("express");
const { Pothole } = require("../models/pothole");
const router = express.Router();
router.get("/add", async (req, res) => {
  try {
    // Tên collection
    const locations = await Pothole.find();
    res.json(locations);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { latitude, longitude, type, author } = req.body;
    const newHole = new Pothole({ latitude, longitude, type, author });
    const hole = Pothole.find();
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

module.exports = router;
