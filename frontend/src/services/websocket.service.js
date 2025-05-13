import { io } from 'socket.io-client';
import api from './api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    // Get the base URL from the api configuration
    this.baseURL = api.defaults.baseURL;
  }

  connect(token) {
    if (this.socket) return;

    // Use the same base URL as api.js
    this.socket = io(this.baseURL, {
      auth: {
        token
      },
      withCredentials: true,
      path: '/socket.io'
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Listen for order status updates
    this.socket.on('orderStatusUpdate', (data) => {
      const callback = this.listeners.get('orderStatusUpdate');
      if (callback) {
        callback(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to order updates
  subscribeToOrderUpdates(callback) {
    this.listeners.set('orderStatusUpdate', callback);
  }

  // Unsubscribe from order updates
  unsubscribeFromOrderUpdates() {
    this.listeners.delete('orderStatusUpdate');
  }

  // Join product room
  joinProductRoom(productId) {
    if (this.socket) {
      this.socket.emit('joinProductRoom', productId);
    }
  }

  // Leave room
  leaveProductRoom(productId) {
    if (this.socket) {
      this.socket.emit('leaveProductRoom', productId);
    }
  }

  // Listen for real-time review updates
  subscribeToReviewUpdates(callback) {
    if (this.socket) {
      this.socket.on('reviewUpdate', callback);
    }
  }

  // Unsubscribe from real-time review updates
  unsubscribeFromReviewUpdates() {
    if (this.socket) {
      this.socket.off('reviewUpdate');
    }
  }
}

export default new WebSocketService(); 