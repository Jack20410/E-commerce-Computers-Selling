const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      path: '/socket.io',
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? [process.env.FRONTEND_URL, 'https://www.jabick.site', 'https://jabick.site']
          : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      allowEIO3: true,
      transports: ['websocket', 'polling']
    });

    // Authentication middleware (optional for basic connection)
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        // Allow connection without authentication but mark as guest
        socket.userId = null;
        socket.isGuest = true;
        console.log('Guest WebSocket connection allowed');
        return next();
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.isGuest = false;
        console.log('Authenticated WebSocket connection for user:', decoded.userId);
        next();
      } catch (err) {
        // Allow connection but mark as guest if token is invalid
        socket.userId = null;
        socket.isGuest = true;
        console.log('Invalid token, allowing as guest connection');
        next();
      }
    });

    this.io.on('connection', (socket) => {
      const userType = socket.isGuest ? 'guest' : 'authenticated';
      console.log(`${userType} user connected: ${socket.userId || 'anonymous'}`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
      }

      // Join product room
      socket.on('joinProductRoom', (productId) => {
        socket.join(`product_${productId}`);
      });
      // Leave product room
      socket.on('leaveProductRoom', (productId) => {
        socket.leave(`product_${productId}`);
      });

      socket.on('disconnect', () => {
        const userType = socket.isGuest ? 'guest' : 'authenticated';
        console.log(`${userType} user disconnected: ${socket.userId || 'anonymous'}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
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