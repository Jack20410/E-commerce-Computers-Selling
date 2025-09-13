const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
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
const errorHandler = require('./Middlewares/errorHandler');

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

// Just use basic CORS for backup
// app.use(cors());

// Keep the security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Routes - Must be registered before other routes
app.use('/health', healthRoutes);

// OpenGraph routes for social media crawlers - handle product pages for crawlers
app.get('/products/:id', async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isCrawler = /facebook|twitter|linkedin|whatsapp|telegram|discord|skype|slack|pinterest|googlebot|bingbot|slackbot|twitterbot|facebookexternalhit|linkedinbot|discordbot|telegrambot|whatsappbot|pinterestbot/i.test(userAgent);
  
  // If it's a crawler, serve the OG version
  if (isCrawler) {
    try {
      const Product = require('./Models/product.model');
      const { getImageUrl, getPlaceholderImage } = require('./utils/imageUtils');
      
      const productId = req.params.id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return next(); // Let frontend handle 404
      }
      
      // Get the main image or first image
      const mainImage = product.images?.find(img => img.isMain);
      const firstImage = product.images?.[0];
      const imageUrl = mainImage?.url || firstImage?.url;
      
      // Get absolute image URL
      let absoluteImageUrl = null;
      if (imageUrl) {
        const relativeUrl = getImageUrl(imageUrl);
        // Convert to absolute URL
        const protocol = req.get('X-Forwarded-Proto') || req.protocol;
        let host = req.get('host');
        
        // If it's a frontend URL, use API host for backend images
        if (relativeUrl.startsWith('/uploads')) {
          host = host.replace('www.', 'api.');
        }
        absoluteImageUrl = `${protocol}://${host}${relativeUrl}`;
      } else {
        // Use placeholder image
        const placeholderUrl = getPlaceholderImage(product.category);
        const protocol = req.get('X-Forwarded-Proto') || req.protocol;
        const host = req.get('host');
        absoluteImageUrl = `${protocol}://${host}${placeholderUrl}`;
      }
      
      // Create the current page URL
      const protocol = req.get('X-Forwarded-Proto') || req.protocol;
      const host = req.get('host');
      const currentUrl = `${protocol}://${host}/products/${productId}`;
      
      // Create meta tags
      const title = `${product.brand} ${product.model} | TechStation`;
      const description = product.description || `${product.brand} ${product.model} - High quality computer hardware at competitive prices.`;
      const price = product.price || 0;
      const availability = product.stock > 0 ? 'in stock' : 'out of stock';
      
      const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/computer-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${absoluteImageUrl}" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="TechStation - Premium Computer Store" />
    <meta property="product:price:amount" content="${price}" />
    <meta property="product:price:currency" content="VND" />
    <meta property="product:availability" content="${availability}" />
    <meta property="product:condition" content="new" />
    <meta property="product:brand" content="${product.brand}" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${absoluteImageUrl}" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
    
    <!-- Redirect to frontend for real users -->
    <script>
      // Only redirect if this is not a bot/crawler
      if (!/bot|crawler|spider|crawling/i.test(navigator.userAgent)) {
        window.location.href = window.location.href;
      }
    </script>
  </head>
  <body>
    <div id="root">
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>${title}</h1>
        <img src="${absoluteImageUrl}" alt="${product.brand} ${product.model}" style="max-width: 400px; height: auto;" />
        <p>${description}</p>
        <p><strong>Price: ${price.toLocaleString('vi-VN')} VND</strong></p>
        <p>Availability: ${availability}</p>
        <a href="${currentUrl}" style="color: #0066cc; text-decoration: none;">View Product Details</a>
      </div>
    </div>
  </body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlContent);
      
    } catch (error) {
      console.error('Error serving OG page:', error);
      return next(); // Let frontend handle the request
    }
  }
  
  // For regular users, let the frontend handle it
  next();
});

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

// Cleanup endpoint for Render URLs (run once to fix old URLs)
const cleanupHandler = async (req, res) => {
  try {
    const { cleanRenderUrls } = require('./utils/cleanRenderUrls');
    const result = await cleanRenderUrls();
    
    res.json({
      success: true,
      message: 'Render URL cleanup completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
};

app.get('/cleanup-render-urls', cleanupHandler);
app.post('/cleanup-render-urls', cleanupHandler);

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
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     error: {
//       status: err.status || 500,
//       message: err.message || 'Internal server error'
//     }
//   });
// });


app.use(errorHandler);
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
});
