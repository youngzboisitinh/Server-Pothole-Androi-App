// eventEmitter.js
import { EventEmitter } from 'events';

// Tạo instance của EventEmitter
const potholeEventEmitter = new EventEmitter();

// Đăng ký sự kiện potholeUpdated
potholeEventEmitter.on('potholeUpdated', (pothole) => {
  console.log('Pothole đã được cập nhật:', pothole);
  // Gọi hàm gửi thông báo
  sendNotification(pothole);  
});

// Hàm gửi thông báo (ví dụ gửi qua API)
const sendNotification = async (pothole) => {
  try {
    await fetch('http://localhost:3000/api/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        potholeId: pothole._id,
        status: pothole.state,
        reason: pothole.rejection_reason,
        userId: pothole.author,
      }),
    });
    console.log('Thông báo gửi thành công');
  } catch (error) {
    console.error('Gửi thông báo lỗi:', error);
  }
};

// Export emitter để sử dụng ở các file khác
export { potholeEventEmitter };
