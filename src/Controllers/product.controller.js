const Product = require('../Models/product.model');
const { upload, deleteProductImages, getImageUrls, getFilenameFromUrl } = require('../utils/upload.util');
const specificationFields = require('../utils/specificationFields');

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

// =====================================================================
// JSON Response Functions
// =====================================================================

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError
      });
    }

    const productData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const imageUrls = getImageUrls(req.body.category, req.files.map(file => file.filename));
      productData.images = imageUrls.map((url, index) => ({
        url,
        isMain: index === 0,
        order: index
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

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        message: req.fileValidationError
      });
    }

    const updateData = { ...req.body };
    delete updateData.imageOrder;
    delete updateData.imageMain;
    delete updateData.deletedImages;

    // Handle image reordering and main image setting
    if (req.body.imageOrder) {
      const newOrder = Array.isArray(req.body.imageOrder) ? req.body.imageOrder : [req.body.imageOrder];
      const imageMain = Array.isArray(req.body.imageMain) ? req.body.imageMain : [req.body.imageMain];
      const reorderedImages = [];
      
      newOrder.forEach((imageId, index) => {
        const image = product.images.find(img => img._id.toString() === imageId);
        if (image) {
          image.order = index;
          image.isMain = imageMain[index] === 'true';
          reorderedImages.push(image);
        }
      });
      
      product.images = reorderedImages;
    }

    // Handle deleted images
    if (req.body.deletedImages) {
      const deletedImages = Array.isArray(req.body.deletedImages) 
        ? req.body.deletedImages 
        : [req.body.deletedImages];

      for (const imageId of deletedImages) {
        const image = product.images.find(img => img._id.toString() === imageId);
        if (image) {
          const filename = getFilenameFromUrl(image.url);
          await deleteProductImages(product.category, [filename]);
        }
      }

      product.images = product.images.filter(
        img => !deletedImages.includes(img._id.toString())
      );

      // If we deleted the main image, set the first remaining image as main
      if (product.images.length > 0 && !product.images.some(img => img.isMain)) {
        product.images[0].isMain = true;
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = getImageUrls(product.category, req.files.map(file => file.filename));
      const newImageObjects = newImageUrls.map((url, index) => ({
        url,
        isMain: product.images.length === 0 && index === 0,
        order: product.images.length + index
      }));

      product.images = [...product.images, ...newImageObjects];

      if (product.images.length > 5) {
        const excessImages = product.images.slice(5);
        const excessFilenames = excessImages.map(img => getFilenameFromUrl(img.url));
        await deleteProductImages(product.category, excessFilenames);
        product.images = product.images.slice(0, 5);
      }
    }

    // Ensure there is always one main image if there are any images
    if (product.images.length > 0 && !product.images.some(img => img.isMain)) {
      product.images[0].isMain = true;
    }

    Object.assign(product, updateData);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
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

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('Backend received request for category:', category);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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

    const filter = { category: { $regex: `^${category}$`, $options: 'i' } };
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

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
    let search = req.query.query;
    if (typeof search !== 'string') search = '';
    search = search.trim();

    if (!search) {
      return res.json({ products: [] });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });

    // Map products to include all fields needed by ProductCard
    const mappedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      model: product.model, // <-- add this line
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0].url : null,
      category: product.category,
      stock: product.stock,
      brand: product.brand,
      images: product.images,
      // add any other fields your ProductCard needs
    }));

    res.json({ products: mappedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching search results' });
  }
};

// Get similar products
exports.getSimilarProducts = async (req, res) => {
  try {
    const { category, productId } = req.params;
    
    console.log('Getting similar products for category:', category, 'excluding:', productId);
    
    const similarProducts = await Product.find({
      category,
      _id: { $ne: productId }
    })
    .sort({ createdAt: -1 })
    .limit(4);
    
    return res.status(200).json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    handleError(error, res);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

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

// Add product images
exports.addProductImages = async (req, res) => {
  try {
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
      await deleteProductImages(req.body.category, req.files.map(file => file.filename));
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const newImageUrls = getImageUrls(product.category, req.files.map(file => file.filename));
    const currentImagesCount = product.images ? product.images.length : 0;
    
    const newImageObjects = newImageUrls.map((url, index) => ({
      url,
      isMain: currentImagesCount === 0 && index === 0,
      order: currentImagesCount + index
    }));
    
    product.images = [...(product.images || []), ...newImageObjects];

    if (product.images.length > 5) {
      const excessImages = product.images.slice(5);
      const excessFilenames = excessImages.map(img => getFilenameFromUrl(img.url));
      await deleteProductImages(product.category, excessFilenames);
      product.images = product.images.slice(0, 5);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product images added successfully',
      data: product
    });
  } catch (error) {
    if (req.files && req.files.length > 0) {
      await deleteProductImages(req.body.category, req.files.map(file => file.filename));
    }
    handleError(error, res);
  }
};

// Delete product image
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

    const wasMain = product.images.find(img => img.url === imageUrl)?.isMain;
    product.images = product.images.filter(img => img.url !== imageUrl);

    if (wasMain && product.images.length > 0) {
      product.images[0].isMain = true;
    }

    product.images.forEach((img, index) => {
      img.order = index;
    });

    await product.save();
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
