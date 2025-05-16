import api from './api';

const systemService = {
  // Track the current session's backend instance
  currentSession: {
    backendId: null,
    backendName: null,
    lastUpdated: null
  },

  // Get system information including container statuses
  getSystemInfo: async () => {
    try {
      const response = await api.get('/health/system-info');
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response format');
      }

      console.log('API Response data:', response.data.data.currentInstance);

      // Update current session tracking
      const data = response.data.data;
      systemService.currentSession = {
        backendId: data.currentInstance?.backend?.id || null,
        backendName: data.currentInstance?.backend?.name || null,
        lastUpdated: new Date().toISOString()
      };

      console.log('Updated session data:', systemService.currentSession);

      return {
        currentInstance: {
          backend: data.currentInstance?.backend || null
        },
        system: {
          status: data.system?.status || 'unknown',
          uptime: data.system?.uptime || 0,
          memory: data.system?.memory || null
        }
      };
    } catch (error) {
      console.error('Error fetching system info:', error);
      // Return last known session if available
      if (systemService.currentSession.lastUpdated) {
        return {
          currentInstance: {
            backend: systemService.currentSession.backendId ? {
              id: systemService.currentSession.backendId,
              name: systemService.currentSession.backendName,
              status: 'degraded'
            } : null
          },
          system: {
            status: 'degraded',
            uptime: 0,
            memory: null
          }
        };
      }
      throw error;
    }
  },

  // Check if a specific service is healthy
  checkServiceHealth: async (serviceName) => {
    try {
      const response = await api.get(`/health/service/${serviceName}`);
      return response.data?.success || false;
    } catch (error) {
      console.error(`Error checking ${serviceName} health:`, error);
      return false;
    }
  },

  // Get current backend instance ID
  getCurrentBackendId: () => {
    return systemService.currentSession.backendId;
  }
};

export default systemService; 