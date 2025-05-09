const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
          : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.connectedUsers.set(socket.userId, socket);

      // Join product room
      socket.on('joinProductRoom', (productId) => {
        socket.join(`product_${productId}`);
      });
      // Leave product room
      socket.on('leaveProductRoom', (productId) => {
        socket.leave(`product_${productId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  // Emit order status update to specific user
  emitOrderStatusUpdate(userId, orderId, newStatus) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit('orderStatusUpdate', {
        userId,
        orderId,
        newStatus
      });
    }
  }

  // Emit review update to all clients in a product room
  emitReviewUpdate(productId, review) {
    if (this.io) {
      this.io.to(`product_${productId}`).emit('reviewUpdate', { productId, review });
    }
  }
}

module.exports = new WebSocketService(); 