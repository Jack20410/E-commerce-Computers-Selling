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
const discountRoutes = require('./Routes/discount.route');
const passport = require('./config/passport');
const websocketService = require('./services/websocket.service');
const healthRoutes = require('./Routes/health');

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

// Serve static files with proper headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for images
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health Check Routes - Must be registered before other routes
app.use('/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Computer Store API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      products: '/api/products',
      users: '/api/users',
      orders: '/api/orders',
      reviews: '/api/reviews',
      discounts: '/api/discount',
      'migrate-images': '/migrate-images'
    },
    timestamp: new Date().toISOString()
  });
});

// Migration endpoint (run once after deployment)
app.post('/migrate-images', async (req, res) => {
  try {
    const { migrateImageUrls } = require('./utils/migrateImageUrls');
    const result = await migrateImageUrls();
    
    res.json({
      success: true,
      message: 'Image URL migration completed',
      data: result
    });
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/users', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discount', discountRoutes);

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
