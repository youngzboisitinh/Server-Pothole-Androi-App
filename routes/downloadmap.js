const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const mapPath = path.join(__dirname, "res", "langdaihoc.map");
router.post("/", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (!fs.existsSync(mapPath)) {
      return res.status(404).json({ message: "Map not found on server." });
    }
    res.download(mapPath, "langdaihoc.map", (err) => {
      if (err) {
        return res.status(500).json({ message: "Error downloading map." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
