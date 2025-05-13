const express = require('express');
const router = express.Router();
const userController = require('../Controllers/user.controller');
const { authenticateToken: auth } = require('../Middlewares/auth.middleware');

// Routes cho quản lý profile
router.get('/profile', auth, userController.getProfile);
router.patch('/update-profile', auth, userController.updateProfile);
router.post('/change-password', auth, userController.changePassword);
router.get('/check-first-login', auth, userController.checkFirstLogin);
router.post('/recover-password', userController.recoverPassword);

// Routes cho admin quản lý user
router.get('/admin/users', auth, userController.getAllUsers);
router.patch('/admin/users/:id/role', auth, userController.updateUserRole);
router.delete('/admin/users/:id', auth, userController.deleteUser);

module.exports = router;