const User = require('../Models/user.model');
const bcrypt = require('../utils/bcryptWrapper');
const jwt = require('jsonwebtoken');
const { validatePassword, generateTempPassword } = require('../utils/password.utils');
const { sendRecoveryEmail } = require('../services/email.service');

const userController = {
  // Lấy thông tin profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      res.json({
        success: true,
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Cập nhật thông tin profile
  updateProfile: async (req, res) => {
    try {
      const { fullName } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      if (!fullName) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên người dùng'
        });
      }

      user.fullName = fullName;
      await user.save();
      
      res.json({
        success: true,
        message: 'Cập nhật tên thành công',
        user: user.toObject({ getters: true, virtuals: true })
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Nếu user chưa từng đặt mật khẩu (Google user), cho phép đặt mới luôn
      if (!user.password) {
        // Không kiểm tra currentPassword
      } else {
        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Mật khẩu hiện tại không đúng'
          });
        }
      }

      // Kiểm tra độ mạnh của mật khẩu mới
      const { isValid, errors } = validatePassword(newPassword);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu không đủ mạnh',
          errors
        });
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.isFirstLogin = false;
      user.passwordChangeRequired = false;

      await user.save();
      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Kiểm tra lần đăng nhập đầu tiên
  checkFirstLogin: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      res.json({
        success: true,
        isFirstLogin: user.isFirstLogin
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Khôi phục mật khẩu
  recoverPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email không tồn tại trong hệ thống'
        });
      }

      // Tạo mật khẩu tạm thời
      const tempPassword = generateTempPassword();
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(tempPassword, salt);
      user.isFirstLogin = true;
      user.passwordChangeRequired = true;

      await user.save();

      // Gửi email với mật khẩu tạm thời
      const emailSent = await sendRecoveryEmail({
        email: user.email,
        fullName: user.fullName,
        tempPassword
      });

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Không thể gửi email khôi phục mật khẩu'
        });
      }

      res.json({
        success: true,
        message: 'Mật khẩu mới đã được gửi đến email của bạn',
        // Trong môi trường development, trả về mật khẩu tạm thời
        ...(process.env.NODE_ENV === 'development' && { tempPassword })
      });
    } catch (error) {
      console.error('Error in recoverPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy danh sách tất cả user (cho admin)
  getAllUsers: async (req, res) => {
    try {
      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }

      const users = await User.find()
        .select('-password -googleProfile -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Cập nhật role của user (cho admin)
  updateUserRole: async (req, res) => {
    try {
      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      const { role } = req.body;

      if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role không hợp lệ'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Không cho phép thay đổi role của chính mình
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Không thể thay đổi role của chính mình'
        });
      }

      user.role = role;
      await user.save();

      res.json({
        success: true,
        message: 'Cập nhật role thành công',
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Xóa user (cho admin)
  deleteUser: async (req, res) => {
    try {
      // Kiểm tra quyền admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;

      // Không cho phép xóa chính mình
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa tài khoản của chính mình'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      await user.deleteOne();

      res.json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
};

module.exports = userController; 