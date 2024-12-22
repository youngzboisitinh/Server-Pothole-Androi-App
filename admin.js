

import express from "express";
import mongoose from "mongoose";
import AdminJS from "adminjs";
import cors from 'cors';
import path from 'path';  // Thêm dòng này để sử dụng module path


import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { Pothole } from "./models/pothole.js";
import { User } from "./models/User.js"; 
import { Journey } from "./models/journey.js";
import { Report } from "./models/report.js";
import { Notification } from "./models/notification.js";
import CustomImageComponent from "./components/CustomImageComponent.js";
import typeColorComponent from "./type-color-component.js";


import dotenv from 'dotenv';
dotenv.config();


const __dirname = import.meta.dirname;

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// Đăng ký adapter cho AdminJS
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});






// Cấu hình AdminJS
const adminJs = new AdminJS({
    resources: [
      {
        resource: Report,
        options: {
          properties: {

            state: {
              isVisible: true,
              availableValues: [
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
              ],
              isQuickEdit: true, // Thêm tính năng chỉnh sửa nhanh
              components: {
                list: typeColorComponent,
              }
            },
            created_at: {
              isVisible: { list: true, show: true, edit: false },
              filterable: true,
            },
            updated_at: {
              isVisible: { list: false, edit: false, show: true },
              filterable: true,
            },
            reason: {
                type: 'string', // Kiểu dữ liệu chuỗi
                isVisible: { list: false, show: true, edit: true }, // Hiển thị trường khi admin chỉnh sửa
                isRequired: true, // Đảm bảo trường này là bắt buộc khi từ chối
              },
          },
          actions: {
            // Tùy chỉnh hành động "Approve" (Chấp thuận)
            approve: {
              actionType: 'record',
              label: 'Accepted',
              icon: 'Check',
              handler: async (request, response, context) => {
                let report = context.record;
                
                  let username = report.param('author');                  
                  let id = report.param('_id');

          
                // Cập nhật trạng thái thành "accepted"
                await report.update({ state: 'accepted' });

                try {
                  await fetch('http://localhost:3000/api/notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      potholeId: id,
                      status: 'accepted',
                      reason: "Thank you for letting us know it.",
                      owner: username,
                    }),
                  });
                } catch (error) {
                  console.error('API Error:', error.response ? error.response.data : error.message);
                  // Xử lý lỗi trong khi gửi thông báo nhưng không dừng quá trình
                }               
  
  
                try {
                  // Xóa pothole tương ứng trong bảng Pothole
                  const deletedPothole = await Pothole.findByIdAndDelete(id);
                  if (!deletedPothole) {
                    throw new Error('Pothole not found');
                  }                 

                  const { currentAdmin} = context;
  
                  return {
                    record: record.toJSON(currentAdmin),
                    msg: 'Pothole deleted and report approved successfully!',
                  };
                } catch (error) {
                  console.error(error);
                  return {
                    record: record.toJSON(currentAdmin),
                    notice: {
                      message: `Error: ${error.message}`,
                      type: 'error',
                    },
                  };
                }
              },
            },
            // Tùy chỉnh hành động "Reject" (Từ chối)
            reject: {
              actionType: 'record',
              label: 'Reject',
              icon: 'Close',
              handler: async (request, response, context) => {
                let report = context.record;
                
                  let username = report.param('author');                  
                  let id = report.param('_id');

          
                // Cập nhật trạng thái thành "accepted"
                await report.update({ state: 'accepted' });

                try {
                  await fetch('http://localhost:3000/api/notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      potholeId: id,
                      status: 'rejected',
                      reason: "We need to reject this Pothole report.",
                      owner: username,
                    }),
                  });
                } catch (error) {
                  console.error('API Error:', error.response ? error.response.data : error.message);
                  // Xử lý lỗi trong khi gửi thông báo nhưng không dừng quá trình
                }               
  
  
                try {
                                 

                  const { currentAdmin} = context;
  
                  return {
                    record: record.toJSON(currentAdmin),
                    msg: 'Report rejected successfully!',
                  };
                } catch (error) {
                  console.error(error);
                  return {
                    record: record.toJSON(currentAdmin),
                    msg: `Error: ${error.message}`,
                  };
                }
              },
            },
          },
        },
      },
      {
        resource: Pothole,
        options: {
          properties: {
            type: {
              availableValues: [
                { value: 'Caution', label: 'Caution' },
                { value: 'Warning', label: 'Warning' },
                { value: 'Danger', label: 'Danger' },
              ],
              isQuickEdit: true, // Thêm tính năng chỉnh sửa nhanh
              components: {
                list: typeColorComponent,
              }
            },            
            
            state: {
              isVisible: true,
              availableValues: [
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
              ],
              isQuickEdit: true, // Thêm tính năng chỉnh sửa nhanh
              components: {
                list: typeColorComponent,
              }
            }, 
            img: {
                type: 'image',
                isArray: false,
                isVisible: { list: true, show: true, edit: true, filter: false },
                components: {
                    list: CustomImageComponent,
                    show: CustomImageComponent,
                }
                
            }
            ,
            created_at: {
              isVisible: { list: true, show: true, edit: false },
              filterable: true,
            },
            updated_at: {
              isVisible: { list: false, edit: false, show: true },
              filterable: true,
            },
            rejection_reason: {
                type: 'string', // Kiểu dữ liệu chuỗi
                isVisible: { list: false, show: true, edit: true }, // Hiển thị trường khi admin chỉnh sửa
                isRequired: false, // Đảm bảo trường này là bắt buộc khi từ chối
              }, 
          },
          
          actions: {
            accept: {
              actionType: 'record',
              icon: 'Check',
              component: false,
              handler: async (request, response, context) => {
                let pothole = context.record;
                
                  let username = pothole.param('author');                  
                  let id = pothole.param('_id');

          
                // Cập nhật trạng thái thành "accepted"
                await pothole.update({ state: 'accepted' });

                try {
                  await fetch('http://localhost:3000/api/notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      potholeId: id,
                      status: 'accepted',
                      reason: "Thank you for uploading this picture.",
                      owner: username,
                    }),
                  });
                } catch (error) {
                  console.error('API Error:', error.response ? error.response.data : error.message);
                  // Xử lý lỗi trong khi gửi thông báo nhưng không dừng quá trình
                } 


          
                
          
                // Đảm bảo trả về đối tượng theo cấu trúc RecordJSON
                const { record, currentAdmin } = context
                return {
                  record: record.toJSON(currentAdmin),  // Sử dụng currentAdmin
                  msg: 'Pothole has been accepted, and the user has been awarded 10 points.',
                };
              },
            },
          
            reject: {
                actionType: 'record',
                component: false,
                icon: 'Cancel',
                handler: async (request, response, context) => {
                  let pothole = context.record;
                  let username = pothole.param('author');
                  let rejectionReason = pothole.param('rejection_reason');
                  let id = pothole.param('_id');

                  console.log("userid" + username);
                  console.log("potholeid" + id);
                  console.log("rejection_reason" + rejectionReason);
                  
              
                  // Lấy lý do từ chối từ bản ghi hiện tại (nếu có)
                  
                  if (!rejectionReason) {
                    rejectionReason = "This image is not accepted. Please try again!";
                  }

           
              
                  try {
                    // Cập nhật trạng thái và lý do từ chối
                    await pothole.update({
                      state: 'rejected',
                      rejection_reason: rejectionReason,
                      img: null,
                    });
              
                    // Lấy thông tin user liên quan đến pothole
                    
                    
              
                    // Gửi thông báo qua API
                    console.log('Sending notification for pothole:', id);
                    try {
                      await fetch('https://13a3-116-110-43-85.ngrok-free.app/api/notification', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          potholeId: id,
                          status: 'rejected',
                          reason: rejectionReason,
                          owner: username,
                        }),
                      });
                    } catch (error) {
                      console.error('API Error:', error.response ? error.response.data : error.message);
                      // Xử lý lỗi trong khi gửi thông báo nhưng không dừng quá trình
                    } 
              
                  } catch (error) {
                    console.error('Error handling pothole rejection:', error.message);
                    // Xử lý các lỗi khác nếu có, không dừng toàn bộ quá trình
                  }
              
                  // Trả về thông tin bản ghi và thông báo
                  const { record, currentAdmin } = context;
                  return {
                    record: record.toJSON(currentAdmin),  // Sử dụng currentAdmin
                    msg: 'Pothole has been rejected.',
                  };
                },
              }
              
          }  
          
          
          
        }, 
      }, 
      {
        resource: User,
        options: {
          properties: {
            password: { isVisible: false },
            verificationCode: { isVisible: false },
            verificationCodeExpires: { isVisible: false },
            createdAt: { isVisible: { list: true, show: true, edit: false } },
            updatedAt: { isVisible: { list: false, show: true } },
            profilePicture: { type: 'string', isVisible: { list: true, show: true, edit: true } },
          },
          actions: {
            new: {
              before: async (request) => {
                if (request.payload.password) {
                  const hashedPassword = await bcrypt.hash(request.payload.password, 10);
                  request.payload.password = hashedPassword;
                }
                return request;
              },
            },
            
          },
        },
      },
      {
        resource: Journey,
        options: {
          properties: {
            user_id: { type: 'string', isVisible: { list: true, show: true, edit: true }, filterable: true },
            start_time: { type: 'date', isVisible: { list: true, show: true, edit: true } },
            end_time: { type: 'date', isVisible: { list: true, show: true, edit: true } },
            start_latitude: { type: 'number', isVisible: { list: true, show: true, edit: true } },
            start_longitude: { type: 'number', isVisible: { list: true, show: true, edit: true } },
            end_latitude: { type: 'number', isVisible: { list: true, show: true, edit: true } },
            end_longitude: { type: 'number', isVisible: { list: true, show: true, edit: true } },
            distance: { type: 'number', isVisible: { list: true, show: true, edit: true }, filterable: true },
            created_at: { type: 'date', isVisible: { list: true, show: true, edit: false }, filterable: true },
            updated_at: { type: 'date', isVisible: { list: false, show: true, edit: false }, filterable: true },
          },
          actions: {
            updateJourney: {
              actionType: 'record',
              icon: 'Update',
              handler: async (request, response, context) => {
                const journey = context.record;
                const { start_time, end_time, distance } = request.payload;
  
                // Update the journey record
                if (start_time) journey.start_time = start_time;
                if (end_time) journey.end_time = end_time;
                if (distance) journey.distance = distance;
  
                await journey.save();
  
                return {
                  record: journey.toJSON(context.currentAdmin),
                  msg: 'Journey updated successfully!',
                };
              },
            },
            generateJourneyReport: {
              actionType: 'global',
              icon: 'BarChart',
              handler: async (request, response, context) => {
                const totalJourneys = await Journey.countDocuments();
                const completedJourneys = await Journey.countDocuments({ end_time: { $ne: null } });
  
                return {
                  msg: `Total Journeys: ${totalJourneys}, Completed Journeys: ${completedJourneys}`,
                };
              },
            },
          },
        },
      },

      {
        resource: Notification,
        options: {
          properties: {
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            owner: {
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            potholeId: {
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            status: {
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            reason: {
              isVisible: { list: true, filter: true, show: true, edit: true }
            }
          }
        }
      },
      
    ],
    rootPath: "/admin",
    branding: {
        companyName: 'Pothole Detection Dashboard',
        softwareBrothers: false, // Tắt logo mặc định của AdminJS
        customStyles: './public/styles.css', 
      },
  });

//Nhóm API của admin


  



// Middleware xác thực
const ADMIN = {
  username: "admin",
  password: "admin",
};

const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (username, password) => {
    if (username === ADMIN.username && password === ADMIN.password) {
      return ADMIN;
    }
    return null;
  },
  cookiePassword: "some-secret-password",
});

// Tạo server Express
const app = express();
app.use(adminJs.options.rootPath, router);

app.use(cors({
    origin: '*', // Hoặc thay bằng URL frontend của bạn
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));


// Đảm bảo rằng server Express phục vụ ảnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Khởi động server
const PORT = 3456;
app.listen(PORT, () => {
  console.log(`Admin panel đang chạy tại http://localhost:${PORT}/admin`);
});


