const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Discount code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{5}$/.test(v);
      },
      message: props => `${props.value} is not a valid discount code! Must be 5 alphanumeric characters.`
    }
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
    max: [100, 'Discount value cannot exceed 100%']
  },
  maxUses: {
    type: Number,
    required: [true, 'Maximum uses is required'],
    min: [1, 'Maximum uses must be at least 1'],
    max: [10, 'Maximum uses cannot exceed 10']
  },
  currentUses: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

// Middleware để tự động chuyển code thành chữ hoa
discountSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Method để kiểm tra xem code có thể sử dụng không
discountSchema.methods.isValid = function() {
  return this.isActive && this.currentUses < this.maxUses;
};

// Method để áp dụng discount
discountSchema.methods.applyDiscount = function(originalPrice) {
  if (!this.isValid()) {
    throw new Error('Discount code is not valid');
  }
  return originalPrice * (1 - this.discountValue / 100);
};

// Static method để tạo code ngẫu nhiên
discountSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount; 