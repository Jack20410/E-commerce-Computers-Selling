const User = require('../Models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../services/email.service');
const { handleGoogleAuth, handleGoogleCallback } = require('../Middlewares/auth.middleware');

// Đăng ký user mới
const register = async (req, res) => {
  try {
    const { email, fullName, address } = req.body;

    // Log request data for debugging
    console.log('Registration request:', {
      email,
      fullName,
      address
    });

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Tạo mật khẩu ngẫu nhiên
    const temporaryPassword = crypto.randomBytes(8).toString('hex');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // Tạo user mới
    const user = new User({
      email: email.toLowerCase(),
      fullName,
      password: hashedPassword,
      addresses: [{
        street: address.street,
        ward: address.ward,
        district: address.district,
        city: address.city,
        isDefault: true
      }]
    });

    await user.save();

    // Gửi email chào mừng với mật khẩu tạm thời
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      password: temporaryPassword
    });

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for your temporary password.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          defaultAddress: user.defaultAddress
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: error.message
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Cập nhật thời gian đăng nhập cuối
    user.lastLogin = new Date();
    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          defaultAddress: user.defaultAddress,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
};

// Xác thực email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during email verification',
      error: error.message
    });
  }
};

// Tạo guest user
const createGuestUser = async (req, res) => {
  try {
    const { email, fullName, address } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    // Tạo guest user mới
    user = new User({
      email: email.toLowerCase(),
      fullName,
      isGuest: true,
      addresses: [{
        ...address,
        isDefault: true
      }]
    });

    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Guest account created successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          defaultAddress: user.defaultAddress,
          isGuest: true,
          guestId: user.guestId
        }
      }
    });
  } catch (error) {
    console.error('Guest user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating guest account',
      error: error.message
    });
  }
};

// Google authentication handlers
const googleLogin = handleGoogleAuth;
const googleCallback = handleGoogleCallback;

module.exports = {
  register,
  login,
  verifyEmail,
  createGuestUser,
  googleLogin,
  googleCallback
}; 