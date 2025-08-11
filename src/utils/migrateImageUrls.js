const Product = require('../Models/product.model');

/**
 * Utility to update existing product image URLs to include full backend URL
 * Run this once after deployment to fix existing products
 */
async function migrateImageUrls() {
  try {
    console.log('Starting image URL migration...');
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`
      : '';

    if (!baseUrl) {
      console.log('No BACKEND_URL set, skipping migration');
      return;
    }

    // Find all products with images
    const products = await Product.find({ 
      images: { $exists: true, $not: { $size: 0 } } 
    });

    console.log(`Found ${products.length} products with images`);

    let updatedCount = 0;

    for (const product of products) {
      let hasUpdates = false;
      
      for (const image of product.images) {
        // Check if URL is relative (starts with /uploads)
        if (image.url && image.url.startsWith('/uploads') && !image.url.includes('http')) {
          console.log(`Updating image URL: ${image.url} -> ${baseUrl}${image.url}`);
          image.url = `${baseUrl}${image.url}`;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await product.save();
        updatedCount++;
        console.log(`Updated product: ${product.name} (${product._id})`);
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} products.`);
    return { updatedCount, totalProducts: products.length };

  } catch (error) {
    console.error('Error during image URL migration:', error);
    throw error;
  }
}

module.exports = { migrateImageUrls };
