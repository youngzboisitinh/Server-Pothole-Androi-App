const express = require("express");
const path = require("path");
const fsPromises = require("fs/promises");

const router = express.Router();

router.get("/:fileName", async (req, res) => {
  const { fileName } = req.params;

  const __dirname = import.meta.dirname;
  let uploadDir = path.resolve(__dirname, "..", "uploads");

  try {
    const filePath = path.join(uploadDir, fileName);

    await fsPromises.access(filePath); // Kiểm tra xem tệp có tồn tại không
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(404).send("File not found");
  }
});

module.exports = router;
