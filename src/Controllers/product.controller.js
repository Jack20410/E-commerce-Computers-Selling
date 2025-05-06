const Product = require('../Models/product.model');
const { upload, deleteProductImages, getImageUrls, getFilenameFromUrl } = require('../utils/upload.util');

// Helper function to handle errors
const handleError = (error, res) => {
  console.error('Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Server Error',
    error: error.message
  });
};

// Middleware for handling multiple image uploads
exports.uploadImages = upload.array('images', 5); // Allow up to 5 images

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Handle file upload error
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError
      });
    }

    // Create product data
    const productData = { ...req.body };
    
    // Add image paths if files were uploaded
    if (req.files && req.files.length > 0) {
      const imageUrls = getImageUrls(req.body.category, req.files.map(file => file.filename));
      productData.images = imageUrls.map((url, index) => ({
        url,
        isMain: index === 0, // First image is main
        order: index // Order based on upload sequence
      }));
    }

    const product = new Product(productData);
    const savedProduct = await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    // Delete uploaded files if product creation fails
    if (req.files && req.files.length > 0) {
      await deleteProductImages(req.body.category, req.files.map(file => file.filename));
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: error.message
      });
    }
    handleError(error, res);
  }
};

// Get all products with pagination and filtering
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      sort = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        perPage: limit
      }
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        error: 'INVALID_ID'
      });
    }
    handleError(error, res);
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: error.message
      });
    }
    handleError(error, res);
  }
};

// Delete product (including all images)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all product images if they exist
    if (product.images && product.images.length > 0) {
      const filenames = product.images.map(url => getFilenameFromUrl(url));
      await deleteProductImages(product.category, filenames);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ category: { $regex: `^${category}$`, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ category: { $regex: `^${category}$`, $options: 'i' } });

    // If no products found, return a "Sold Out" message
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Sold Out',
        pagination: {
          current: page,
          pages: 0,
          total: 0,
          perPage: limit
        }
      });
    }

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        perPage: limit
      }
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    const products = await Product.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        perPage: limit
      }
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock value'
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Add images to product
exports.addProductImages = async (req, res) => {
  try {
    // Handle file upload error
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      // Delete uploaded files if product doesn't exist
      await deleteProductImages(req.body.category, req.files.map(file => file.filename));
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add new image URLs to existing ones
    const newImageUrls = getImageUrls(product.category, req.files.map(file => file.filename));
    const currentImagesCount = product.images ? product.images.length : 0;
    
    const newImageObjects = newImageUrls.map((url, index) => ({
      url,
      isMain: currentImagesCount === 0 && index === 0, // Only set as main if there are no existing images
      order: currentImagesCount + index // Order continues from existing images
    }));
    
    product.images = [...(product.images || []), ...newImageObjects];

    // Ensure we don't exceed maximum number of images (5)
    if (product.images.length > 5) {
      // Delete excess images
      const excessImages = product.images.slice(5);
      const excessFilenames = excessImages.map(img => getFilenameFromUrl(img.url));
      await deleteProductImages(product.category, excessFilenames);
      
      // Keep only first 5 images
      product.images = product.images.slice(0, 5);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product images added successfully',
      data: product
    });
  } catch (error) {
    // Delete uploaded files if update fails
    if (req.files && req.files.length > 0) {
      await deleteProductImages(req.body.category, req.files.map(file => file.filename));
    }
    handleError(error, res);
  }
};

// Delete specific product image
exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const filename = getFilenameFromUrl(imageUrl);
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL'
      });
    }

    // Remove image from product
    const wasMain = product.images.find(img => img.url === imageUrl)?.isMain;
    product.images = product.images.filter(img => img.url !== imageUrl);

    // If we removed the main image and there are other images, set the first one as main
    if (wasMain && product.images.length > 0) {
      product.images[0].isMain = true;
    }

    // Reorder remaining images
    product.images.forEach((img, index) => {
      img.order = index;
    });

    await product.save();

    // Delete image file
    await deleteProductImages(product.category, [filename]);

    res.status(200).json({
      success: true,
      message: 'Product image deleted successfully',
      data: product
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Render add product form
exports.renderAddProductForm = (req, res) => {
  res.render('products/add', {
    title: 'Add Product'
  });
};

// Render category page
exports.renderCategoryPage = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { category };
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      if (sortField.startsWith('-')) {
        sort[sortField.substring(1)] = -1;
      } else {
        sort[sortField] = 1;
      }
    } else {
      sort = { createdAt: -1 };
    }

    // Get products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get unique brands for filter dropdown
    const brands = await Product.distinct('brand', { category });

    res.render('products/category', {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)}s`,
      category,
      products,
      brands,
      current: page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    handleError(error, res);
  }
};
