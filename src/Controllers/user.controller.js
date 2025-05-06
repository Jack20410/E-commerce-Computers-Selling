const User = require('../Models/user.model');
const bcrypt = require('bcryptjs');
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
      const { fullName, address } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      if (fullName) user.fullName = fullName;
      
      if (address) {
        // Nếu chưa có địa chỉ nào, đặt địa chỉ mới làm mặc định
        const isFirstAddress = user.addresses.length === 0;
        address.isDefault = isFirstAddress;
        
        user.addresses.push(address);
      }

      await user.save();
      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
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

      // Kiểm tra mật khẩu hiện tại
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại không đúng'
        });
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
  }
};

module.exports = userController; 