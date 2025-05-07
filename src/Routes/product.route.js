const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProducts_HTML,
  getProductById,
  getProductById_HTML,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByCategory_HTML,
  searchProducts,
  searchProducts_HTML,
  updateStock,
  uploadImages,
  addProductImages,
  deleteProductImage,
  getSimilarProducts,
  renderAddProductForm_HTML,
  renderEditProductForm_HTML
} = require('../Controllers/product.controller');

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }
  next();
};

// =====================================================================
// API ROUTES (JSON Responses for React frontend)
// All API routes are prefixed with /api
// =====================================================================

// Search products
router.get('/api/search', searchProducts);

// Get all products & create new product
router.route('/api/products')
  .get(getProducts)
  .post(uploadImages, createProduct);

// Get products by category
router.get('/api/category/:category', getProductsByCategory);

// Get all brands for a category
router.get('/api/category/:category/brands', async (req, res) => {
  try {
    const { category } = req.params;
    const Product = require('../Models/product.model');
    const brands = await Product.distinct('brand', { category: { $regex: `^${category}$`, $options: 'i' } });
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch brands', error: error.message });
  }
});

// Get similar products in same category (excluding current product)
router.get('/api/similar/:category/:productId', getSimilarProducts);

// Get, update, delete product by ID
router.route('/api/:id')
  .get(validateObjectId, getProductById)
  .put(validateObjectId, uploadImages, updateProduct)
  .delete(validateObjectId, deleteProduct);

// Manage product images
router.route('/api/:id/images')
  .post(validateObjectId, uploadImages, addProductImages)
  .delete(validateObjectId, deleteProductImage);

// Update product stock
router.patch('/api/:id/stock', validateObjectId, updateStock);

// =====================================================================
// WEB ROUTES (HTML Responses for Server-Side Rendering)
// These routes render HTML pages
// =====================================================================


// Product listing and category pages
router.get('/category/:category', getProductsByCategory_HTML);

// Add product form
router.get('/add', renderAddProductForm_HTML);

// Edit product form
router.get('/:id/edit', validateObjectId, renderEditProductForm_HTML);


// Product management routes (Create, Update, Delete)
router.route('/')
  .post(uploadImages, createProduct);  // Create new product

router.route('/:id')
  .put(validateObjectId, uploadImages, updateProduct)
  .delete(validateObjectId, deleteProduct);

module.exports = router;
