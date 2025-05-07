const express = require('express');
const router = express.Router();
const addressController = require('../Controllers/address.controller');

router.get('/provinces', addressController.getProvinces);
router.get('/districts/:provinceCode', addressController.getDistricts);
router.get('/wards/:districtCode', addressController.getWards);

module.exports = router; 