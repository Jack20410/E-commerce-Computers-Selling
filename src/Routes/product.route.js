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
  getSimilarProducts,
  getSpecificationsByCategory,
  getAllProducts,
  addVariant,
  removeVariant,
  getVariants,
  updateVariantDescription,
  searchPotentialVariants
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

// Middleware to validate variant MongoDB ObjectId
const validateVariantObjectId = (req, res, next) => {
  if (!req.params.variantId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid variant ID format'
    });
  }
  next();
};

// =====================================================================
// API ROUTES (JSON Responses for React frontend)
// All API routes are prefixed with /api
// =====================================================================

// Get all products without pagination
router.get('/all', getAllProducts);

// Search products
router.get('/search', searchProducts);

// Get all products & create new product
router.route('/')
  .get(getProducts)
  .post(uploadImages, createProduct);

  
// Get products by category
router.get('/category/:category', getProductsByCategory);



// Get all brands for a category
router.get('/category/:category/brands', async (req, res) => {
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
router.get('/similar/:category/:productId', getSimilarProducts);

// Get specifications for a category
router.get('/category/:category/specifications', getSpecificationsByCategory);

// Get, update, delete product by ID
router.route('/:id')
  .get(validateObjectId, getProductById)
  .put(validateObjectId, uploadImages, updateProduct)
  .delete(validateObjectId, deleteProduct);

// Manage product images
router.route('/:id/images')
  .post(validateObjectId, uploadImages, addProductImages);

// Manage single image
router.route('/:id/image')
  .delete(validateObjectId, deleteProductImage);

// Update product stock
router.patch('/:id/stock', validateObjectId, updateStock);

// =====================================================================
// Product Variants Routes
// =====================================================================

// Search for potential variants for a product
router.get('/:id/potential-variants', validateObjectId, searchPotentialVariants);

// Get all variants of a product
router.get('/:id/variants', validateObjectId, getVariants);

// Add a variant to a product
router.post('/:id/variants', validateObjectId, addVariant);

// Remove a variant from a product
router.delete('/:id/variants/:variantId', [validateObjectId, validateVariantObjectId], removeVariant);

// Update variant description
router.patch('/:id/variants/:variantId/description', [validateObjectId, validateVariantObjectId], updateVariantDescription);

module.exports = router;
