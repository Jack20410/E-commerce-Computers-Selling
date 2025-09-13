const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  register,
  login,
  verifyEmail,
  createGuestUser
} = require('../Controllers/auth.controller');
const { authenticateToken } = require('../Middlewares/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/guest', createGuestUser);
router.get('/verify-email/:token', verifyEmail);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` 
  }),
  (req, res) => {
    // Generate JWT token here
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token and user data
    const userObj = {
      id: req.user._id,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role || 'user',
      isEmailVerified: req.user.isEmailVerified,
      googleId: req.user.googleId
    };
    
    res.redirect(`${process.env.FRONTEND_URL}/oauth2-redirect?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
  }
);

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