const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  updateStock,
  uploadImages,
  addProductImages,
  deleteProductImage,
  renderAddProductForm,
  renderCategoryPage,
  renderEditProductForm,
  getSimilarProducts
} = require('../Controllers/product.controller');

// Middleware for checking if ID is valid
const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }
  next();
};

// ====================================
// HTML RENDERING ROUTES (View Routes)
// ====================================
// These routes return HTML for browser viewing

// View forms
router.get('/add', renderAddProductForm);
router.get('/:id/edit', validateObjectId, renderEditProductForm);

// Category page (HTML)
router.get('/category/:category', renderCategoryPage);

// =====================================================================================================================================================
// API ROUTES (JSON Responses)
// =====================================================================================================================================================
// All API routes return JSON and are prefixed with /api/

// Product listing and creation
router.route('/api/products')
  .get(getProducts)
  .post(uploadImages, createProduct);

// Search products
router.get('/api/search', searchProducts);

// Category products
router.get('/api/category/:category', getProductsByCategory);

// Similar products 
router.get('/api/similar/:category/:productId', getSimilarProducts);

// Image management
router.route('/api/:id/images')
  .post(validateObjectId, uploadImages, addProductImages)
  .delete(validateObjectId, deleteProductImage);

// Individual product operations
router.route('/api/:id')
  .get(validateObjectId, getProductById)
  .put(validateObjectId, uploadImages, updateProduct)
  .delete(validateObjectId, deleteProduct);

// Stock update
router.patch('/api/:id/stock', validateObjectId, updateStock);

// =====================================================================================================================================================
// LEGACY ROUTES (for backward compatibility)
// =====================================================================================================================================================
// These routes support existing frontend code

router.route('/')
  .get(getProducts)
  .post(uploadImages, createProduct);

router.route('/:id')
  .get(validateObjectId, getProductById)
  .put(validateObjectId, uploadImages, updateProduct)
  .delete(validateObjectId, deleteProduct);

router.route('/:id/images')
  .post(validateObjectId, uploadImages, addProductImages)
  .delete(validateObjectId, deleteProductImage);

router.get('/search', searchProducts);
router.patch('/:id/stock', validateObjectId, updateStock);

module.exports = router;
