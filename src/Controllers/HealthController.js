const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const mongoose = require('mongoose');
const redisClient = require('../config/redis');

class HealthController {
  // Basic health check for load balancers
  async getBasicHealth(req, res) {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString() 
    });
  }

  // Detailed health check of all services
  async getDetailedHealth(req, res) {
    try {
      // Check MongoDB connection
      const mongoStatus = mongoose.connection.readyState === 1;
      
      // Check Redis connection
      const redisStatus = redisClient.status === 'ready';

      if (mongoStatus && redisStatus) {
        res.status(200).json({
          status: 'healthy',
          mongodb: 'connected',
          redis: 'connected',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          mongodb: mongoStatus ? 'connected' : 'disconnected',
          redis: redisStatus ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get system information including container details
  async getSystemInfo(req, res) {
    try {
      // Get container ID
      const containerId = await this.getContainerId();
      
      // Get frontend instance ID from request headers if available
      const frontendId = req.headers['x-frontend-id'];
      const frontendName = req.headers['x-frontend-name'];

      // Format container ID to match Docker style (12 chars)
      const formatContainerId = (id) => id ? id.substring(0, 12) : null;
      
      // Get formatted container ID
      const shortId = formatContainerId(containerId);
      
      // Get container name directly from hostname
      // In Docker, the hostname is set to the container name by default
      const containerName = os.hostname();
      
      console.log('Container info:');
      console.log('- ID:', shortId);
      console.log('- Hostname/Name:', containerName);

      // Get system metrics
      const systemMetrics = {
        status: 'healthy',
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        }
      };

      // Get active services
      const services = await this.getActiveServices();

      // Return formatted response
      res.json({
        success: true,
        data: {
          currentInstance: {
            frontend: frontendId ? {
              id: formatContainerId(frontendId),
              name: frontendName || 'frontend',
              status: 'active'
            } : null,
            backend: {
              id: shortId,
              name: containerName,
              status: 'active'
            }
          },
          services,
          system: systemMetrics
        }
      });
    } catch (error) {
      console.error('Error getting system info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system information',
        error: error.message
      });
    }
  }

  // Get specific service health status
  async getServiceHealth(req, res) {
    try {
      const { serviceName } = req.params;
      let status = 'unknown';
      let healthy = false;

      switch (serviceName.toLowerCase()) {
        case 'redis':
          healthy = redisClient.status === 'ready';
          status = healthy ? 'healthy' : 'unhealthy';
          break;
        case 'mongodb':
          healthy = mongoose.connection.readyState === 1;
          status = healthy ? 'healthy' : 'unhealthy';
          break;
        case 'nginx':
        case 'load-balancer':
          // Assuming Nginx is always up if we can handle the request
          healthy = true;
          status = 'healthy';
          break;
      }

      res.json({
        success: true,
        data: {
          healthy,
          status
        }
      });
    } catch (error) {
      console.error(`Error checking ${req.params.serviceName} health:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to check ${req.params.serviceName} health`,
        error: error.message
      });
    }
  }

  // Helper method to get container ID
  async getContainerId() {
    try {
      // Try to get container ID from cgroup
      const { stdout } = await execAsync('cat /proc/self/cgroup | grep -o -E "[0-9a-f]{64}" | head -n 1');
      return stdout.trim() || os.hostname();
    } catch (error) {
      console.error('Error getting container ID:', error);
      return os.hostname();
    }
  }

  // Helper method to get active services
  async getActiveServices() {
    try {
      const services = [];
      
      // Check Redis
      if (redisClient.status === 'ready') {
        services.push({
          id: 'redis-1',
          name: 'Redis',
          status: 'healthy'
        });
      }

      // Check MongoDB
      if (mongoose.connection.readyState === 1) {
        services.push({
          id: 'mongodb-1',
          name: 'MongoDB',
          status: 'healthy'
        });
      }

      // Add Nginx load balancer
      services.push({
        id: 'nginx-lb',
        name: 'Load Balancer',
        status: 'healthy'
      });

      return services;
    } catch (error) {
      console.error('Error getting active services:', error);
      return [];
    }
  }
}

module.exports = new HealthController(); 