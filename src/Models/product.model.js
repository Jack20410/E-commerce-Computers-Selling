const mongoose = require('mongoose');
require('../config/database')();

// Helper function to convert UTC to GMT+7
const convertToVietnamTime = (date) => {
  return new Date(date.getTime() + (7 * 60 * 60 * 1000));
};

// Image schema for better structure and validation
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  isMain: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
});

// Base specifications that all products share
const baseSpecsSchema = {
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  images: {
    type: [imageSchema],
    validate: {
      validator: function(images) {
        // Check maximum number of images
        if (images.length > 5) {
          return false;
        }
        
        // Check if there's exactly one main image if there are any images
        if (images.length > 0) {
          const mainImages = images.filter(img => img.isMain);
          if (mainImages.length !== 1) {
            return false;
          }
        }

        // Check for unique order values
        const orders = images.map(img => img.order);
        const uniqueOrders = new Set(orders);
        if (orders.length !== uniqueOrders.size) {
          return false;
        }

        return true;
      },
      message: props => {
        if (props.value.length > 5) {
          return 'Maximum 5 images allowed per product';
        }
        if (props.value.length > 0) {
          const mainImages = props.value.filter(img => img.isMain);
          if (mainImages.length !== 1) {
            return 'Product must have exactly one main image';
          }
        }
        return 'Image order values must be unique';
      }
    }
  }
};

// Category-specific specification schemas
const categorySpecs = {
  pc: {
    processor: { type: String, required: true },
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    graphicsCard: { type: String, required: true },
    motherboard: { type: String, required: true },
    powerSupply: { type: String, required: true },
    case: { type: String, required: true },
    operatingSystem: { type: String },
  },
  laptop: {
    processor: { type: String, required: true },
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    displaySize: { type: String, required: true },
    graphicsCard: { type: String, required: true },
    batteryLife: { type: String, required: true },
    weight: { type: String, required: true },
    operatingSystem: { type: String },
  },
  cpu: {
    socket: { type: String, required: true },
    cores: { type: Number, required: true },
    threads: { type: Number, required: true },
    baseSpeed: { type: String, required: true },
    boostSpeed: { type: String, required: true },
    graphic: { type: String, required: true },
    tdp: { type: String, required: true },
  },
  graphicsCard: {
    chipset: { type: String, required: true },
    memory: { type: String, required: true },
    memoryType: { type: String, required: true },
    coreClock: { type: String, required: true },
    boostClock: { type: String, required: true },
    powerConsumption: { type: String, required: true },
    ports: [{ type: String }],
  },
  motherboard: {
    socket: { type: String, required: true },
    chipset: { type: String, required: true },
    formFactor: { type: String, required: true },
    memorySlots: { type: Number, required: true },
    maxMemory: { type: String, required: true },
    supportedMemoryType: { type: String, required: true },
    pcieSlots: [{ type: String }],
    sataConnectors: { type: Number, required: true },
  },
  memory: {
    type: { type: String, required: true }, // DDR4, DDR5, etc.
    capacity: { type: String, required: true },
    speed: { type: String, required: true },
    latency: { type: String, required: true },
    voltage: { type: String, required: true },
  },
  storage: {
    type: { type: String, required: true }, // SSD, HDD, NVMe
    capacity: { type: String, required: true },
    formFactor: { type: String, required: true },
    interface: { type: String, required: true },
    readSpeed: { type: String, required: true },
    writeSpeed: { type: String, required: true },
  },
  monitor: {
    displaySize: { type: String, required: true },
    resolution: { type: String, required: true },
    panelType: { type: String, required: true },
    refreshRate: { type: String, required: true },
    responseTime: { type: String, required: true },
    ports: [{ type: String }],
    hdrSupport: { type: Boolean, default: false },
  },
  gears: {
    type: { type: String, required: true }, // Mouse, Keyboard, Headset, etc.
    connectivity: { type: String, required: true }, // Wired, Wireless
    features: [{ type: String }],
  },
};

const productSchema = new mongoose.Schema({
  ...baseSpecsSchema,
  category: {
    type: String,
    required: true,
    enum: Object.keys(categorySpecs),
  },
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(specs) {
        const categorySpec = categorySpecs[this.category];
        if (!categorySpec) return false;
        
        // Check if all required fields for the category are present
        for (const [key, value] of Object.entries(categorySpec)) {
          if (value.required && !(key in specs)) {
            return false;
          }
        }
        return true;
      },
      message: 'Missing required specifications for the selected category'
    }
  },
  // Add variants field - bidirectional references to other product variants
  variants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Optional field to store a human-readable description of what makes this variant different
  variantDescription: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: function() {
      return convertToVietnamTime(new Date());
    }
  },
  updatedAt: {
    type: Date,
    default: function() {
      return convertToVietnamTime(new Date());
    }
  }
}, {
  timestamps: false // Disable automatic timestamps
});

// Pre-save middleware to update timestamps
productSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = convertToVietnamTime(new Date());
  }
  this.updatedAt = convertToVietnamTime(new Date());
  next();
});

// Method to set main image
productSchema.methods.setMainImage = function(imageId) {
  if (!this.images || this.images.length === 0) {
    throw new Error('No images to set as main');
  }

  // Reset all images to non-main
  this.images.forEach(img => {
    img.isMain = false;
  });

  // Set the specified image as main
  const image = this.images.id(imageId);
  if (!image) {
    throw new Error('Image not found');
  }
  image.isMain = true;
};

// Method to reorder images
productSchema.methods.reorderImages = function(imageOrders) {
  if (!Array.isArray(imageOrders)) {
    throw new Error('Image orders must be an array');
  }

  // Validate that all images exist
  imageOrders.forEach(({imageId, order}) => {
    const image = this.images.id(imageId);
    if (!image) {
      throw new Error(`Image ${imageId} not found`);
    }
  });

  // Update orders
  imageOrders.forEach(({imageId, order}) => {
    const image = this.images.id(imageId);
    image.order = order;
  });

  // Sort images by order
  this.images.sort((a, b) => a.order - b.order);
};

// Method to add images
productSchema.methods.addImages = function(imageUrls) {
  if (!Array.isArray(imageUrls)) {
    imageUrls = [imageUrls];
  }

  const currentCount = this.images ? this.images.length : 0;
  if (currentCount + imageUrls.length > 5) {
    throw new Error('Maximum 5 images allowed per product');
  }

  const newImages = imageUrls.map((url, index) => ({
    url,
    isMain: currentCount === 0 && index === 0, // Set as main if it's the first image
    order: currentCount + index
  }));

  if (!this.images) {
    this.images = newImages;
  } else {
    this.images.push(...newImages);
  }
};

// Method to add a variant to this product
productSchema.methods.addVariant = async function(variantId) {
  // Add the variant if it doesn't exist
  if (!this.variants.some(v => v.toString() === variantId.toString())) {
    this.variants.push(variantId);
    await this.save();
  }
};

// Method to remove a variant from this product
productSchema.methods.removeVariant = async function(variantId) {
  // Remove the variant if it exists
  this.variants = this.variants.filter(v => v.toString() !== variantId.toString());
  await this.save();
};

// Static method to link two products as variants of each other
productSchema.statics.linkVariants = async function(productId1, productId2) {
  const product1 = await this.findById(productId1);
  const product2 = await this.findById(productId2);
  
  if (!product1 || !product2) {
    throw new Error('One or both products not found');
  }
  
  // Add each product to the other's variants array if not already there
  await product1.addVariant(productId2);
  await product2.addVariant(productId1);
  
  return { product1, product2 };
};

// Static method to unlink two products that are variants
productSchema.statics.unlinkVariants = async function(productId1, productId2) {
  const product1 = await this.findById(productId1);
  const product2 = await this.findById(productId2);
  
  if (!product1 || !product2) {
    throw new Error('One or both products not found');
  }
  
  // Remove each product from the other's variants array
  await product1.removeVariant(productId2);
  await product2.removeVariant(productId1);
  
  return { product1, product2 };
};

// Method to transform the document when converting to JSON
productSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Convert timestamps to Vietnam time
  if (obj.createdAt) {
    obj.createdAt = convertToVietnamTime(new Date(obj.createdAt));
  }
  if (obj.updatedAt) {
    obj.updatedAt = convertToVietnamTime(new Date(obj.updatedAt));
  }
  
  return obj;
};

// Virtual for formatted dates
productSchema.virtual('createdAtVN').get(function() {
  return this.createdAt ? convertToVietnamTime(this.createdAt).toISOString() : null;
});

productSchema.virtual('updatedAtVN').get(function() {
  return this.updatedAt ? convertToVietnamTime(this.updatedAt).toISOString() : null;
});

// Add indexes for better query performance
productSchema.index({ category: 1 });
productSchema.index({ 'specifications.brand': 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: 1 });
productSchema.index({ updatedAt: 1 });
productSchema.index({ variants: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
