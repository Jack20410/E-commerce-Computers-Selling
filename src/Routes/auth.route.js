const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  createGuestUser,
  googleLogin,
  googleCallback
} = require('../Controllers/auth.controller');
const { authenticateToken } = require('../Middlewares/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/guest', createGuestUser);
router.get('/verify-email/:token', verifyEmail);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Protected routes (cần JWT token)
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        defaultAddress: req.user.defaultAddress,
        isEmailVerified: req.user.isEmailVerified,
        isGuest: req.user.isGuest
      }
    }
  });
});

module.exports = router; 