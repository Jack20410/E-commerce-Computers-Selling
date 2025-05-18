import { io } from 'socket.io-client';
import api from './api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    // Get the base URL from the api configuration
    this.baseURL = api.defaults.baseURL;
    this.connectionAttempted = false;
    this.pendingRooms = new Set();
    this.reconnectInterval = null;
  }

  // Check if the socket is connected safely
  isConnected() {
    return this.socket && this.socket.connected;
  }

  connect(token) {
    if (this.isConnected()) return true;
    
    // Clear any existing reconnect intervals
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.connectionAttempted = true;
    
    const options = {
      withCredentials: true,
      path: '/socket.io',
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      autoConnect: true
    };
    
    // Only add token if it exists
    if (token) {
      options.auth = { token };
    }

    try {
      console.log('Connecting to WebSocket at:', this.baseURL);
      
      // Use the same base URL as api.js
      this.socket = io(this.baseURL, options);
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.connectionAttempted = true;
        
        // Join any pending rooms on connect
        if (this.pendingRooms.size > 0) {
          console.log('Joining pending rooms:', Array.from(this.pendingRooms));
          this.pendingRooms.forEach(roomId => {
            if (this.socket) {
              console.log(`Joining pending room: ${roomId}`);
              this.socket.emit('joinProductRoom', roomId);
            }
          });
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        // Retry connection with polling transport if websocket fails
        if (this.socket && this.socket.io && this.socket.io.opts.transports[0] === 'websocket') {
          console.log('Retrying with polling transport');
          this.socket.io.opts.transports = ['polling', 'websocket'];
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server, reason:', reason);
        
        // Only set up reconnect for non-intentional disconnects
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.setupReconnect(token);
        }
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Setup standard listeners for events
      this.setupStandardListeners();
      
      return true;
    } catch (error) {
      console.error('Error initializing socket connection:', error);
      
      // Setup reconnect on initial connection error
      this.setupReconnect(token);
      
      return false;
    }
  }
  
  setupReconnect(token) {
    if (this.reconnectInterval) return;
    
    console.log('Setting up reconnect interval');
    this.reconnectInterval = setInterval(() => {
      if (!this.isConnected()) {
        console.log('Attempting to reconnect WebSocket...');
        this.connect(token);
      } else {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    }, 5000); // Try every 5 seconds
  }

  setupStandardListeners() {
    // Cleanup existing listeners first
    if (this.socket) {
      this.socket.off('orderStatusUpdate');
      this.socket.off('reviewUpdate');
      
      // Listen for order status updates
      this.socket.on('orderStatusUpdate', (data) => {
        const callback = this.listeners.get('orderStatusUpdate');
        if (callback) {
          callback(data);
        }
      });
      
      // Listen for review updates
      this.socket.on('reviewUpdate', (data) => {
        console.log("Received review update:", data);
        const callback = this.listeners.get('reviewUpdate');
        if (callback) {
          callback(data);
        }
      });
    }
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionAttempted = false;
      this.pendingRooms.clear();
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
    if (!productId) return;
    
    // Add to pending rooms regardless of connection status
    this.pendingRooms.add(productId);
    
    // Check if socket exists and is connected before emitting
    if (this.isConnected()) {
      console.log(`Joining product room: ${productId}`);
      this.socket.emit('joinProductRoom', productId);
    } else {
      console.log(`Added ${productId} to pending rooms`);
      
      // Try to connect if not already connected
      if (!this.connectionAttempted) {
        console.log('No socket exists or not connected, connecting...');
        const token = localStorage.getItem('token') || '';
        this.connect(token);
      }
    }
  }

  // Leave room
  leaveProductRoom(productId) {
    if (!productId) return;
    
    // Remove from pending rooms first
    this.pendingRooms.delete(productId);
    
    // Only emit if socket exists and is connected
    if (this.isConnected()) {
      console.log(`Leaving product room: ${productId}`);
      this.socket.emit('leaveProductRoom', productId);
    }
  }

  // Listen for real-time review updates
  subscribeToReviewUpdates(callback) {
    if (callback && typeof callback === 'function') {
      this.listeners.set('reviewUpdate', callback);
    }
  }

  // Unsubscribe from real-time review updates
  unsubscribeFromReviewUpdates() {
    this.listeners.delete('reviewUpdate');
  }
}

export default new WebSocketService(); 