const mongoose = require('mongoose');
const { provinces, districts, wards } = require('vietnam-provinces');

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Address name is required'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  ward: {
    type: String,
    required: [true, 'Ward is required'],
    trim: true,
    validate: {
      validator: function(v) {
        const wardData = wards.find(ward => ward.name === v);
        return wardData !== undefined;
      },
      message: props => `${props.value} is not a valid ward in Vietnam!`
    }
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    validate: {
      validator: function(v) {
        const districtData = districts.find(district => district.name === v);
        return districtData !== undefined;
      },
      message: props => `${props.value} is not a valid district in Vietnam!`
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    validate: {
      validator: function(v) {
        const provinceData = provinces.find(province => province.name === v);
        return provinceData !== undefined;
      },
      message: props => `${props.value} is not a valid city/province in Vietnam!`
    }
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password chỉ required nếu không có googleId
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleProfile: {
    type: Object,
    select: false // Mặc định không lấy thông tin này khi query
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  addresses: [addressSchema],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  passwordChangeRequired: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  isGuest: {
    type: Boolean,
    default: false
  },
  guestId: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Middleware để đảm bảo chỉ có một địa chỉ mặc định
userSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      const error = new Error('Only one address can be set as default');
      return next(error);
    }
  }
  next();
});

// Middleware để đảm bảo guest user có guestId
userSchema.pre('save', function(next) {
  if (this.isGuest && !this.guestId) {
    this.guestId = 'GUEST_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Middleware để cập nhật lastPasswordChange khi mật khẩu thay đổi
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.lastPasswordChange = new Date();
  }
  next();
});

// Virtual để lấy địa chỉ mặc định
userSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault);
});

// Method để kiểm tra role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Method để kiểm tra xem user có phải là guest không
userSchema.methods.isGuestUser = function() {
  return this.isGuest === true;
};

// Thêm static method để lấy danh sách tỉnh/thành phố
userSchema.statics.getProvinces = function() {
  return provinces.map(province => province.name);
};

// Thêm static method để lấy danh sách quận/huyện theo tỉnh/thành phố
userSchema.statics.getDistricts = function(provinceName) {
  const province = provinces.find(p => p.name === provinceName);
  if (!province) return [];
  return districts
    .filter(district => district.province_code === province.code)
    .map(district => district.name);
};

// Thêm static method để lấy danh sách phường/xã theo quận/huyện
userSchema.statics.getWards = function(districtName) {
  const district = districts.find(d => d.name === districtName);
  if (!district) return [];
  return wards
    .filter(ward => ward.district_code === district.code)
    .map(ward => ward.name);
};

const User = mongoose.model('User', userSchema);
const Address = mongoose.model('Address', addressSchema);

module.exports = User;
