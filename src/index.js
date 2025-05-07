const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const productRoutes = require('./Routes/product.route');
const authRoutes = require('./Routes/auth.route');
const userRoutes = require('./Routes/user.route');
const addressRoutes = require('./Routes/address.route');
const passport = require('./Config/passport');

// Initialize express app
const app = express();

// Initialize passport
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, '../frontend/dist'))); // Serve React build

// API Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/api/addresses', addressRoutes);


// Home page (HTML rendered by EJS)
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Welcome to Computer Store',
    messages: {}
  });
}); 

// Error handling middleware (must be before catch-all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    messages: {},
    error: {
      status: err.status || 500,
      message: err.message || 'Internal server error'
    }
  });
});

// // React SPA fallback (serve index.html for unknown routes)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
// });

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
});
