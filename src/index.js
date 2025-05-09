const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const connectDB = require('./config/database');
const productRoutes = require('./Routes/product.route');
const authRoutes = require('./Routes/auth.route');
const userRoutes = require('./Routes/user.route');
const addressRoutes = require('./Routes/address.route');
const orderRoutes = require('./Routes/order.route');
const reviewRoutes = require('./Routes/review.route');
const passport = require('./Config/passport');
const websocketService = require('./services/websocket.service');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
websocketService.initialize(server);

// Initialize passport
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      status: err.status || 500,
      message: err.message || 'Internal server error'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
});
