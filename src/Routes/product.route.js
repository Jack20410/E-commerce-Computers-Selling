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
  getSimilarProducts
} = require('../Controllers/product.controller');

// Middleware kiểm tra ID MongoDB hợp lệ
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
// All routes are prefixed with /products
// =====================================================================

//   Search
router.get('/api/search', searchProducts);

// et all products & create new product
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

//Update product stock
router.patch('/api/:id/stock', validateObjectId, updateStock);

// ===============================================================
// Không còn legacy routes hoặc HTML rendering để tránh xung đột
// ===============================================================

module.exports = router;
