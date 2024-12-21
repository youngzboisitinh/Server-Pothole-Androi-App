import express from 'express';
import multer from 'multer';
import path from 'path';
import { updateUser, updateNewUser, getUserInfo, getUserInfoByUsername, getAllUsers } from '../controllers/userController.js';  // Nếu muốn import tất cả từ controller
import fs from 'fs';
import fsPromises from 'fs/promises';  




const router = express.Router();

//8. Lấy ảnh
router.get('/:fileName', async (req, res) => {
    const {fileName} = req.params; 
      
      const __dirname = import.meta.dirname;
      let  uploadDir = path.resolve(__dirname, '..', 'uploads');
  
      
  
      try {
        // Kiểm tra xem file có tồn tại trong thư mục uploads hay không
        const filePath = path.join(uploadDir, fileName);

        // Kiểm tra xem file có tồn tại không
        await fsPromises.access(filePath);  // Kiểm tra xem tệp có tồn tại không
        res.sendFile(filePath);  // Trả về file nếu tồn tại
    } catch (error) {
        console.error(error); // In lỗi ra console
        res.status(404).send('File not found');  // Trả về lỗi nếu file không tìm thấy
    }
  });


export default router;