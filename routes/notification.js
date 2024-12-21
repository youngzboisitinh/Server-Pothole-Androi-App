import express from "express";
import Notification from "../models/notification.js"; // Đường dẫn đến model Notification của bạn


const router = express.Router();

// Lưu trữ các kết nối SSE
let clients = [];

// Endpoint SSE để gửi thông báo cho tất cả client
router.get("/notifications", (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Thêm client vào danh sách
  clients.push(res);

  // Khi client đóng kết nối, loại bỏ nó khỏi danh sách
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// Endpoint để tạo thông báo và gửi SSE cho các client
router.post("/", async (req, res) => {
  try {
    const { userId, potholeId, status, reason } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || !potholeId || !status) {
      return res.status(400).json({ error: "userId, potholeId, and status are required." });
    }

    // Tạo thông báo mới
    const newNotification = new Notification({
      userId,
      potholeId,
      status,
      reason: status === "rejected" ? reason : null,
    });

    // Lưu thông báo vào cơ sở dữ liệu
    await newNotification.save();

    // Gửi thông báo đến tất cả các client đang kết nối
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify(newNotification)}\n\n`);
    });

    return res.status(201).json({
      message: "Notification created successfully.",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});



// Endpoint để lấy tất cả thông báo
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find();
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Endpoint để lấy thông báo theo userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId });
    if (notifications.length === 0) {
      return res.status(404).json({ error: "No notifications found for this user." });
    }

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Endpoint để xóa một thông báo theo ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    return res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
