const express = require('express');
const router = express.Router();
const addressController = require('../Controllers/address.controller');
const { authenticateToken } = require('../Middlewares/auth.middleware');

// Routes cho địa chỉ Việt Nam
router.get('/provinces', addressController.getProvinces);
router.get('/districts/:provinceCode', addressController.getDistricts);
router.get('/wards/:districtCode', addressController.getWards);

// Routes cho quản lý địa chỉ giao hàng (yêu cầu xác thực)
router.get('/user-addresses', authenticateToken, addressController.getUserAddresses);
router.post('/add', authenticateToken, addressController.addAddress);
router.put('/update/:addressId', authenticateToken, addressController.updateAddress);
router.delete('/delete/:addressId', authenticateToken, addressController.deleteAddress);

module.exports = router; 