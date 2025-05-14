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
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate({
        path: 'variants',
        select: '_id brand model price stock images specifications variantDescription'
      });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
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
      
      const deletedImageUrls = Array.isArray(req.body.deletedImageUrls) 
        ? req.body.deletedImageUrls 
        : req.body.deletedImageUrls ? [req.body.deletedImageUrls] : [];
      
      const deletedImageFilenames = Array.isArray(req.body.deletedImageFilenames) 
        ? req.body.deletedImageFilenames 
        : req.body.deletedImageFilenames ? [req.body.deletedImageFilenames] : [];

      console.log('Processing deleted images:', {
        deletedImages,
        deletedImageUrls,
        deletedImageFilenames,
        category: product.category,
        totalImages: product.images.length,
        productId: product._id.toString(),
        imageIds: product.images.map(img => img._id.toString())
      });

      // First, collect all images to be deleted
      const imagesToDelete = [];
      
      // Try to find images using all available identifiers
      for (let i = 0; i < deletedImages.length; i++) {
        const imageId = deletedImages[i];
        const imageUrl = i < deletedImageUrls.length ? deletedImageUrls[i] : null;
        const filename = i < deletedImageFilenames.length ? deletedImageFilenames[i] : null;
        
        // Try to find the image by ID, URL, or filename
        const image = product.images.find(img => 
          img._id.toString() === imageId.toString() || 
          (imageUrl && img.url === imageUrl) ||
          (filename && img.url.endsWith(filename))
        );
        
        if (image) {
          console.log('Found image to delete:', {
            imageId,
            foundImageId: image._id.toString(),
            imageUrl: image.url,
            filename: getFilenameFromUrl(image.url),
            category: product.category
          });
          imagesToDelete.push(image);
        } else {
          console.log('Image not found:', {
            searchId: imageId,
            searchUrl: imageUrl,
            searchFilename: filename,
            availableIds: product.images.map(img => img._id.toString()),
            imageUrls: product.images.map(img => img.url)
          });
        }
      }

      // Then delete the files and remove images from the product
      for (const image of imagesToDelete) {
        const filename = getFilenameFromUrl(image.url);
        if (filename) {
          console.log('Attempting to delete file:', {
            category: product.category.toLowerCase(), 
            filename,
            fullUrl: image.url
          });
          await deleteProductImages(product.category.toLowerCase(), [filename]);
        }
        
        // Remove the image from the product's images array
        product.images = product.images.filter(img => img._id.toString() !== image._id.toString());
      }

      // If we deleted the main image, set the first remaining image as main
      if (product.images.length > 0 && !product.images.some(img => img.isMain)) {
        product.images[0].isMain = true;
        console.log('Set new main image:', product.images[0]._id);
      }

      // Update order of remaining images
      product.images.forEach((img, index) => {
        img.order = index;
      });
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
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
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

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!search) {
      return res.json({ products: [], pagination: { current: 1, pages: 0, total: 0, perPage: limit } });
    }

    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    const filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    const mappedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      model: product.model,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0].url : null,
      category: product.category,
      stock: product.stock,
      brand: product.brand,
      images: product.images,
    }));

    res.json({
      products: mappedProducts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        perPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching search results' });
  }
};

// Get similar products (items in the same category, excluding the current product)
exports.getSimilarProducts = async (req, res) => {
  try {
    const { category, productId } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    
    // First get current product to access its variants
    const currentProduct = await Product.findById(productId);
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Create a filter to exclude current product and its variants
    const excludeIds = [productId, ...(currentProduct.variants || []).map(v => v.toString())];
    
    // Find similar products
    const similarProducts = await Product.find({
      category: category,
      _id: { $nin: excludeIds }
    })
    .sort({ createdAt: -1 })
    .limit(limit);
    
    res.status(200).json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
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

    // Delete all associated images
    if (product.images && product.images.length > 0) {
      const filenames = product.images
        .map(img => getFilenameFromUrl(img.url))
        .filter(filename => filename !== null);
        
      if (filenames.length > 0) {
        await deleteProductImages(product.category, filenames);
      }
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
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: 'Image ID is required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Try to find the image by its ID
    let image = product.images.find(img => img._id.toString() === imageId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
        details: {
          searchId: imageId,
          availableIds: product.images.map(img => img._id.toString())
        }
      });
    }

    const filename = getFilenameFromUrl(image.url);
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL',
        details: { url: image.url }
      });
    }


    const wasMain = image.isMain;
    const deleteResult = await deleteProductImages(product.category.toLowerCase(), [filename]);

    // Remove the image from the product
    product.images = product.images.filter(img => img._id.toString() !== imageId);

    // If we deleted the main image, set the first remaining image as main
    if (wasMain && product.images.length > 0) {
      product.images[0].isMain = true;
    }

    // Update order of remaining images
    product.images.forEach((img, index) => {
      img.order = index;
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product image deleted successfully',
      data: product
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get all unique specifications for a category
exports.getSpecificationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });

    // Collect unique values for each specification key
    const specMap = {};
    products.forEach(product => {
      if (product.specifications) {
        Object.entries(product.specifications).forEach(([key, value]) => {
          if (!specMap[key]) specMap[key] = new Set();
          specMap[key].add(value);
        });
      }
    });

    // Convert sets to arrays and sort
    const result = {};
    Object.entries(specMap).forEach(([key, set]) => {
      result[key] = Array.from(set).sort();
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch specifications', error: error.message });
  }
};

// Get all products without pagination
exports.getAllProducts = async (req, res) => {
  try {
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

    const products = await Product.find(filter).sort(sort);
    
    res.status(200).json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    handleError(error, res);
  }
};

// =====================================================================
// Variant Management
// =====================================================================

// Search for potential variant products
exports.searchPotentialVariants = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.query;
    
    // Get the base product
    const baseProduct = await Product.findById(id);
    if (!baseProduct) {
      return res.status(404).json({
        success: false,
        message: 'Base product not found'
      });
    }
    
    // Build the search filter
    const filter = {
      // Must be same category and brand
      category: baseProduct.category,
      brand: baseProduct.brand,
      // Exclude the base product itself
      _id: { $ne: baseProduct._id }
    };
    
    // Exclude existing variants
    if (baseProduct.variants && baseProduct.variants.length > 0) {
      filter._id.$nin = baseProduct.variants;
    }
    
    // If a search query is provided, add it to the filter
    if (query && query.trim()) {
      const searchTerm = query.trim();
      
      // Search in model and specifications
      filter.$or = [
        { model: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
      
      // Add search in specifications fields
      // This is more complex as specifications are mixed type fields
      // We'll do this post-query filtering in memory
    }
    
    // Find matching products
    const potentialVariants = await Product.find(filter)
      .select('_id brand model price stock images specifications description')
      .limit(20);
    
    // If a search query was provided, do additional in-memory filtering on specifications
    let results = potentialVariants;
    
    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      
      // Function to check if a specification value contains the search term
      const containsSearchTerm = (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.toLowerCase().includes(searchTerm);
        if (typeof value === 'number') return String(value).includes(searchTerm);
        if (Array.isArray(value)) return value.some(v => containsSearchTerm(v));
        return false;
      };
      
      // Score products by how well they match the search term
      results = potentialVariants.map(product => {
        let score = 0;
        
        // Check model name (highest weight)
        if (product.model.toLowerCase().includes(searchTerm)) {
          score += 10;
        }
        
        // Check specifications
        if (product.specifications) {
          Object.entries(product.specifications).forEach(([key, value]) => {
            // Check if key contains search term
            if (key.toLowerCase().includes(searchTerm)) {
              score += 3;
            }
            
            // Check if value contains search term
            if (containsSearchTerm(value)) {
              score += 5;
            }
          });
        }
        
        // Check description
        if (product.description && product.description.toLowerCase().includes(searchTerm)) {
          score += 2;
        }
        
        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
    }
    
    // Calculate similarity to base product for more intelligent suggestions
    if (baseProduct.specifications) {
      results = results.map(product => {
        // Calculate a similarity score based on matching specifications
        let similarityScore = 0;
        let differenceCount = 0;
        
        if (product.specifications) {
          // Count matching and differing specs
          Object.keys(baseProduct.specifications).forEach(key => {
            if (product.specifications[key] !== undefined) {
              if (String(product.specifications[key]) === String(baseProduct.specifications[key])) {
                similarityScore += 1;
              } else {
                differenceCount += 1;
              }
            }
          });
          
          // Additional specs in the variant that don't exist in base product
          const additionalSpecs = Object.keys(product.specifications).filter(
            key => baseProduct.specifications[key] === undefined
          ).length;
          
          // A good variant has some differences but is mostly similar
          // Ideal is high similarity with some strategic differences
          const totalSpecCount = Object.keys(baseProduct.specifications).length;
          
          // Calculate normalized similarity (0-100)
          const normalizedSimilarity = totalSpecCount > 0 
            ? Math.round((similarityScore / totalSpecCount) * 100)
            : 0;
            
          // Variants with at least 1 difference but high similarity are best
          product.similarityScore = differenceCount > 0 ? normalizedSimilarity : 0;
          product.differences = differenceCount;
        } else {
          product.similarityScore = 0;
          product.differences = 0;
        }
        
        return product;
      })
      .sort((a, b) => {
        // Sort by: has differences (> 0), then by similarity score (higher is better)
        if ((a.differences > 0 && b.differences > 0) || (a.differences === 0 && b.differences === 0)) {
          return b.similarityScore - a.similarityScore;
        }
        return b.differences - a.differences;
      });
    }
    
    res.status(200).json({
      success: true,
      data: results,
      baseProduct: {
        id: baseProduct._id,
        brand: baseProduct.brand,
        model: baseProduct.model,
        category: baseProduct.category
      }
    });
    
  } catch (error) {
    handleError(error, res);
  }
};

// Add a variant to a product
exports.addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { variantId, variantDescription } = req.body;

    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: 'Variant ID is required'
      });
    }

    if (id === variantId) {
      return res.status(400).json({
        success: false,
        message: 'A product cannot be a variant of itself'
      });
    }

    // Get both products
    const product = await Product.findById(id);
    const variantProduct = await Product.findById(variantId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!variantProduct) {
      return res.status(404).json({
        success: false,
        message: 'Variant product not found'
      });
    }

    // Check if the variant is already linked
    if (product.variants.includes(variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Products are already linked as variants'
      });
    }

    // Check if products have the same category and brand (required for variants)
    if (product.category !== variantProduct.category) {
      return res.status(400).json({
        success: false,
        message: 'Variants must be of the same category'
      });
    }
    
    if (product.brand !== variantProduct.brand) {
      return res.status(400).json({
        success: false,
        message: 'Variants must be of the same brand'
      });
    }

    // Link products as variants (adds each to the other's variants array)
    await Product.linkVariants(id, variantId);

    // Update variant descriptions if provided
    if (variantDescription) {
      product.variantDescription = variantDescription;
      await product.save();
    }

    const updatedProduct = await Product.findById(id).populate({
      path: 'variants',
      select: '_id brand model price stock images specifications variantDescription'
    });

    res.status(200).json({
      success: true,
      message: 'Variant added successfully',
      data: updatedProduct
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Remove a variant from a product
exports.removeVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    const product = await Product.findById(id);
    const variantProduct = await Product.findById(variantId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!variantProduct) {
      return res.status(404).json({
        success: false,
        message: 'Variant product not found'
      });
    }

    // Check if the products are linked as variants
    if (!product.variants.some(v => v.toString() === variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Products are not linked as variants'
      });
    }

    // Unlink products as variants
    await Product.unlinkVariants(id, variantId);

    const updatedProduct = await Product.findById(id).populate({
      path: 'variants',
      select: '_id brand model price stock images specifications variantDescription'
    });

    res.status(200).json({
      success: true,
      message: 'Variant removed successfully',
      data: updatedProduct
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Get variants of a product
exports.getVariants = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate({
      path: 'variants',
      select: '_id brand model price stock images specifications variantDescription'
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product.variants || []
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Update variant description
exports.updateVariantDescription = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { variantDescription } = req.body;

    if (variantDescription === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Variant description is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if the products are linked as variants
    if (!product.variants.some(v => v.toString() === variantId)) {
      return res.status(400).json({
        success: false,
        message: 'Products are not linked as variants'
      });
    }

    product.variantDescription = variantDescription;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant description updated successfully',
      data: product
    });
  } catch (error) {
    handleError(error, res);
  }
};
