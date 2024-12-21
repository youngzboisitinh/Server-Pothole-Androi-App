import { User } from "../models/User.js";

// API cập nhật thông tin người dùng mới
const updateNewUser = async (req, res) => {
    const { nickname, sex, bio, birthday, phoneNumber } = req.body;

    // Check if required fields are provided
    if (!nickname || !sex || !bio || !birthday || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // If a file (profile picture) was uploaded, include it in the update
    const profilePicture = req.file ? req.file.filename : null;

    try {
        const updatedUser = {
            nickname,
            sex,
            bio,
            dateOfBirth: birthday,
            phoneNumber,
            profilePicture,
            isFirstLogin: false,
            updatedAt: new Date().toISOString(),
        };

        // Find and update user by ID (assuming req.user contains the user's ID)
        const user = await User.findByIdAndUpdate(req.user.id, updatedUser, { new: true });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Xây dựng đường dẫn URL cho ảnh đại diện
    const profilePictureUrl = user.profilePicture
    ? `${"http://192.168.1.44:3000"}/uploads/${user.profilePicture}`  // Giả sử BASE_URL chứa URL cơ sở của server
    : null;


        // Return success response
        res.status(200).json({            
              ...user.toObject(),  // Chuyển đổi Mongoose document thành plain object
              profilePicture: profilePictureUrl  // Thay thế trường profilePicture bằng URL
        });
    } catch (err) {
        console.error(err);  // Log error for debugging
        res.status(500).json({ error: 'Failed to update user' });
    }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID user từ middleware auth
    const updateData = {}; // Đối tượng chứa thông tin cần cập nhật

    // Kiểm tra và thêm các trường từ request body nếu có
    if (req.body.name) updateData.username = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.phoneNumber) updateData.phoneNumber = req.body.phoneNumber;
    if (req.body.bio) updateData.bio = req.body.bio;
    if (req.body.sex) updateData.sex = req.body.sex;
    if (req.body.birthday) updateData.dateOfBirth = req.body.birthday;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.isVerified !== undefined) updateData.isVerified = req.body.isVerified;
    if (req.body.score !== undefined) updateData.score = req.body.score;
    if (req.body.isFirstLogin !== undefined) updateData.isFirstLogin = req.body.isFirstLogin;
    if (req.body.message) updateData.message = req.body.message;
    if (req.body.verificationCode) updateData.verificationCode = req.body.verificationCode;
    if (req.body.verificationCodeExpires) updateData.verificationCodeExpires = req.body.verificationCodeExpires;

    // Cập nhật ảnh đại diện nếu file được upload
    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    // Cập nhật thời gian cập nhật
    updateData.updatedAt = Date.now();

    // Tìm và cập nhật thông tin user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    // Trả về thông tin user sau khi cập nhật
    res.status(200).json({ message: 'Cập nhật thành công', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật user' });
  }
};


// Lấy thông tin user
const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; 
    const user = await User.findById(userId).select('-password -verificationCode'); // Không trả về password và verificationCode

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      sex: user.sex,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      score: user.score,
      isFirstLogin: user.isFirstLogin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find().select('-password -verificationCode');

        if (!allUsers || allUsers.length === 0) {
            return res.status(404).json({ message: 'No users available' });
        }

        res.status(200).json({
            message: 'Successfully retrieved all users',
            data: allUsers, 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getUserInfoByUsername = async (req, res) => {
    try {
      const username = req.params.username;  
      const user = await User.findOne({ username }).select('-password -verificationCode'); 
  
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }
  
      res.status(200).json({
        id: user.id,
        username: user.username,  
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        sex: user.sex,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        score: user.score,
        isFirstLogin: user.isFirstLogin
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };




//module.exports = { updateUser, updateNewUser, getUserInfo, getUserInfoByUsername, getAllUsers};

export { updateUser, updateNewUser, getUserInfo, getUserInfoByUsername, getAllUsers };

