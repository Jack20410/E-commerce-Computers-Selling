const express = require('express');
const router = express.Router();
const healthController = require('../Controllers/HealthController');

// Basic health check for load balancers
router.get('/', healthController.getBasicHealth.bind(healthController));

// Detailed health check
router.get('/health', healthController.getDetailedHealth.bind(healthController));

// Get system information
router.get('/system-info', healthController.getSystemInfo.bind(healthController));

// Get specific service health
router.get('/service/:serviceName', healthController.getServiceHealth.bind(healthController));

module.exports = router; 