import express from 'express';
import { Report } from '../models/report.js'; // Import model Report

const router = express.Router();

/**
 * API: Gửi yêu cầu xóa pothole
 * URL: POST /api/reports/delete-request
 */
router.post('/delete-request', async (req, res) => {
  const { author, potholeId, reason } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!author || !potholeId || !reason) {
    return res.status(400).json({ message: 'Missing required fields: author, potholeId, and reason are required.' });
  }

  try {
    // Tạo mới một báo cáo yêu cầu xóa pothole
    const newReport = new Report({
      author,
      potholeId,
      reason,
      state: 'pending', // Báo cáo mặc định ở trạng thái "pending"
    });

    // Lưu báo cáo vào cơ sở dữ liệu
    await newReport.save();

    res.status(201).json({
      message: 'Delete request submitted successfully.',
      report: newReport,
    });
  } catch (error) {
    console.error('Error while submitting delete request:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

export default router;
