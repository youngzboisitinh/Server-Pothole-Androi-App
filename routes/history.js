const express = require("express");
const { Pothole } = require("../models/pothole");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/history",auth, async (req, res) => {
    try {
        const username = req.user.username; 
  
      const userPotholes = await Pothole.find({ author: username });
      res.status(200).json(userPotholes);
    } catch (error) {
      console.error("Failed to fetch user history:", error);
      res.status(500).json({ error: "Failed to fetch user history" });
    }
  });

  
  module.exports = router;
  