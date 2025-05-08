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

    console.log('Starting deleteProductImages:', {
      category,
      filenames
    });

    // Get absolute path to uploads directory
    const uploadsPath = path.resolve(__dirname, '../uploads');
    console.log('Base uploads directory:', uploadsPath);

    // Get absolute path to category directory
    const categoryPath = path.join(uploadsPath, category);
    console.log('Category directory:', categoryPath);

    // Check if category directory exists
    if (!fs.existsSync(categoryPath)) {
      console.error('Category directory does not exist:', categoryPath);
      return false;
    }

    // List directory contents before deletion
    const beforeContents = fs.readdirSync(categoryPath);
    console.log('Directory contents before deletion:', {
      directory: categoryPath,
      files: beforeContents
    });

    const results = await Promise.all(
      filenames.map(async (filename) => {
        // Get absolute path to file
        const filepath = path.join(categoryPath, filename);
        console.log('Processing file:', {
          filename,
          fullPath: filepath
        });

        try {
          // Check if file exists
          const exists = fs.existsSync(filepath);
          console.log('File exists check:', {
            filename,
            exists,
            path: filepath
          });

          if (exists) {
            // Try to delete the file
            await fs.promises.unlink(filepath);
            console.log('Successfully deleted file:', filepath);
            return true;
          } else {
            console.log('File not found:', {
              filename,
              searchPath: filepath,
              availableFiles: beforeContents
            });
            return false;
          }
        } catch (err) {
          console.error('Error deleting file:', {
            filename,
            filepath,
            error: err.message,
            stack: err.stack
          });
          return false;
        }
      })
    );

    // List directory contents after deletion
    const afterContents = fs.readdirSync(categoryPath);
    console.log('Directory contents after deletion:', {
      directory: categoryPath,
      files: afterContents,
      deletedFiles: beforeContents.filter(f => !afterContents.includes(f))
    });

    const success = results.every(result => result);
    console.log('Delete operation completed:', {
      success,
      results,
      deletedCount: results.filter(r => r).length
    });

    return success;
  } catch (error) {
    console.error('Error in deleteProductImages:', {
      error: error.message,
      stack: error.stack
    });
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
  if (!url) {
    console.log('getFilenameFromUrl: URL is null or empty');
    return null;
  }

  console.log('Processing URL:', url);
  
  try {
    // Remove the domain part if present (e.g., http://localhost:3001)
    const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
    console.log('Cleaned URL:', cleanUrl);
    
    // Split the remaining path
    const parts = cleanUrl.split('/').filter(Boolean); // Remove empty strings
    console.log('URL parts:', parts);
    
    // URL format should be uploads/category/filename
    // We need at least 3 parts: "uploads", "category", "filename"
    if (parts.length < 3 || parts[0] !== 'uploads') {
      console.log('Invalid URL format:', {
        partsLength: parts.length,
        firstPart: parts[0]
      });
      return null;
    }
    
    // Get the filename (last part of the URL)
    const filename = parts[parts.length - 1];
    console.log('Extracted filename:', filename);
    
    // More flexible validation - look for any pattern that resembles a product ID followed by a hash
    // This regex matches something like: 681a4ff9e732259cf5b1cfdf-3e1c927cc0ff85d9.png
    if (!filename.match(/^[a-f0-9]+-[a-f0-9]+\.[a-zA-Z]+$/)) {
      console.log('Warning: Filename does not match expected format, but will try to use it anyway:', filename);
    }
    
    return filename;
  } catch (error) {
    console.error('Error processing URL:', error);
    return null;
  }
};

module.exports = {
  upload,
  deleteProductImages,
  getImageUrls,
  getFilenameFromUrl
}; 