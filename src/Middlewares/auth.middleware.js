const jwt = require('jsonwebtoken');
const User = require('../Models/user.model');
const passport = require('../Config/passport');

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token not found'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Middleware kiểm tra role admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware cho phép truy cập nếu đã xác thực hoặc là guest
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Nếu token không hợp lệ, vẫn cho phép request tiếp tục
    next();
  }
};

// Middleware xác thực guest user bằng email
const authenticateGuest = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for guest authentication'
      });
    }

    // Tìm user với email (có thể là guest hoặc registered user)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Nếu tìm thấy user, attach vào request
      req.guestUser = user;
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Guest authentication error',
      error: error.message
    });
  }
};

// Middleware xử lý authentication với Google
const handleGoogleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// Middleware xử lý callback từ Google
const handleGoogleCallback = (req, res, next) => {
  passport.authenticate('google', async (err, user) => {
    try {
      if (err || !user) {
        // Redirect về trang login với thông báo lỗi
        return res.redirect('http://localhost:3000/login?error=google_auth_failed');
      }
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      // Encode user info để truyền qua URL, bao gồm cả googleId
      const userInfo = encodeURIComponent(JSON.stringify({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        googleId: user.googleId
      }));
      // Redirect về frontend
      return res.redirect(`http://localhost:3000/oauth2-redirect?token=${token}&user=${userInfo}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  authenticateGuest,
  handleGoogleAuth,
  handleGoogleCallback
}; 