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
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.hasRole('admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
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
  handleGoogleAuth,
  handleGoogleCallback
}; 