import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) return;

    this.socket = io('http://localhost:3001', {
      auth: {
        token
      }
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
}

export default new WebSocketService(); 