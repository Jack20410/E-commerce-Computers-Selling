const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get category from request body
    const category = req.body.category;
    if (!category) {
      return cb(new Error('Category is required for file upload'));
    }

    // Create category directory if it doesn't exist
    const categoryDir = path.join(uploadsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    cb(null, categoryDir);
  },
  filename: function (req, file, cb) {
    // Get product ID from request params or generate temporary one
    const productId = req.params.id || Date.now();
    
    // Generate unique identifier
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    
    // Get file extension
    const ext = path.extname(file.originalname);
    
    // Create filename with product ID and unique suffix
    cb(null, `${productId}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Function to delete product images
const deleteProductImages = async (category, filenames) => {
  try {
    if (!Array.isArray(filenames)) {
      filenames = [filenames];
    }

    const results = await Promise.all(
      filenames.map(async (filename) => {
        const filepath = path.join(uploadsDir, category, filename);
        if (fs.existsSync(filepath)) {
          await fs.promises.unlink(filepath);
          return true;
        }
        return false;
      })
    );

    return results.every(result => result);
  } catch (error) {
    console.error('Error deleting files:', error);
    return false;
  }
};

// Function to get image URLs
const getImageUrls = (category, filenames) => {
  if (!category || !filenames) return [];
  
  if (!Array.isArray(filenames)) {
    filenames = [filenames];
  }

  return filenames.map(filename => `/uploads/${category}/${filename}`);
};

// Function to extract filename from URL
const getFilenameFromUrl = (url) => {
  if (!url) return null;
  return url.split('/').pop();
};

module.exports = {
  upload,
  deleteProductImages,
  getImageUrls,
  getFilenameFromUrl
}; 