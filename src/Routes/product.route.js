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
  renderCategoryPage
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

// View routes
router.get('/add', renderAddProductForm);
router.get('/category/:category', renderCategoryPage);
// router.get('/category/:category/view', renderCategoryPage); // đổi đường dẫn view

// API routes
router.route('/')
  .post(uploadImages, createProduct)
  .get(getProducts);

  
router.route('/').get(getProducts);

// Search route
router.get('/search', searchProducts);

// Category API route (JSON)
router.get('/category/:category', getProductsByCategory); // chỉ trả về JSON cho frontend

// Image management routes
router.route('/:id/images')
  .post(validateObjectId, uploadImages, addProductImages)
  .delete(validateObjectId, deleteProductImage);

// Individual product routes with ID validation
router.route('/:id')
  .get(validateObjectId, getProductById)
  .put(validateObjectId, updateProduct)
  .delete(validateObjectId, deleteProduct);

// Stock update route
router.patch('/:id/stock', validateObjectId, updateStock);

module.exports = router;
