const express = require('express');
const router = express.Router();
const authController = require('../Controllers/auth.controller');
const { authenticateToken } = require('../Middlewares/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/guest', authController.createGuestUser);
router.get('/verify-email/:token', authController.verifyEmail);

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