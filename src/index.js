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
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL?.replace('https://', 'http://'), // Allow both HTTP and HTTPS
      process.env.FRONTEND_URL?.replace('http://', 'https://'),
    ].filter(Boolean) // Remove any undefined values
  : [
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'http://localhost:5173',
      'http://localhost',
      'http://localhost:80'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
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

// Migration endpoint (run once after deployment) - supports both GET and POST
const migrationHandler = async (req, res) => {
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
};

app.get('/migrate-images', migrationHandler);
app.post('/migrate-images', migrationHandler);

// Debug endpoint to check uploads folder
app.get('/debug/uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    console.log('Checking uploads path:', uploadsPath);
    
    const exists = fs.existsSync(uploadsPath);
    console.log('Uploads folder exists:', exists);
    
    if (!exists) {
      return res.json({
        success: false,
        message: 'Uploads folder does not exist',
        path: uploadsPath
      });
    }
    
    const categories = fs.readdirSync(uploadsPath);
    console.log('Categories found:', categories);
    
    const result = {};
    categories.forEach(category => {
      const categoryPath = path.join(uploadsPath, category);
      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath);
        result[category] = {
          count: files.length,
          files: files.slice(0, 5) // Show first 5 files
        };
      }
    });
    
    res.json({
      success: true,
      uploadsPath,
      categories: result
    });
    
  } catch (error) {
    console.error('Error checking uploads:', error);
    res.status(500).json({
      success: false,
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
