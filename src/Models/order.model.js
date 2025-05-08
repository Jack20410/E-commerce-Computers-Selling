const mongoose = require('mongoose');
const { Address } = require('./user.model');

// Order Item Schema - simplified from product model
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    // Lưu lại thông tin sản phẩm tại thời điểm đặt hàng
    productSnapshot: {
        name: String,
        brand: String,
        model: String,
        category: String,
        image: String, // URL của ảnh chính
        specifications: mongoose.Schema.Types.Mixed
    }
});

// Status History Schema
const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    note: String
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    loyaltyPointsUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    loyaltyPointsEarned: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'banking', 'momo'],
        required: true
    },
    currentStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [statusHistorySchema],
    emailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Tính tổng tiền sau khi áp dụng điểm loyalty
orderSchema.methods.calculateFinalAmount = function() {
    const loyaltyDiscount = this.loyaltyPointsUsed * 1000;
    this.totalAmount = this.subtotal - loyaltyDiscount;
    return this.totalAmount;
};

// Kiểm tra tính hợp lệ của việc chuyển trạng thái
orderSchema.methods.isValidStatusTransition = function(newStatus) {
    const statusTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['shipping', 'cancelled'],
        'shipping': ['delivered', 'cancelled'],
        'delivered': [], // Trạng thái cuối cùng
        'cancelled': [] // Trạng thái cuối cùng
    };

    return statusTransitions[this.currentStatus]?.includes(newStatus);
};

// Tự động cập nhật lịch sử trạng thái và kiểm tra tính hợp lệ
orderSchema.pre('save', async function(next) {
    try {
        if (this.isModified('currentStatus')) {
            // Nếu là đơn hàng mới, cho phép trạng thái pending
            if (!this.isNew && !this.isValidStatusTransition(this.currentStatus)) {
                throw new Error(`Invalid status transition from ${this.statusHistory[this.statusHistory.length - 1].status} to ${this.currentStatus}`);
            }

            this.statusHistory.push({
                status: this.currentStatus,
                timestamp: new Date()
            });
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Tính điểm loyalty (10% tổng giá trị đơn hàng)
orderSchema.methods.calculateLoyaltyPoints = function() {
    // 10% của tổng giá trị đơn hàng, 1 point = 1,000 VND
    const pointsEarned = Math.floor((this.totalAmount * 0.1) / 1000);
    this.loyaltyPointsEarned = pointsEarned;
    return pointsEarned;
};

// Virtual field để lấy trạng thái cuối cùng
orderSchema.virtual('lastStatus').get(function() {
    if (this.statusHistory && this.statusHistory.length > 0) {
        return this.statusHistory[this.statusHistory.length - 1];
    }
    return null;
});

// Virtual field để chuyển đổi loyalty points sang tiền
orderSchema.virtual('loyaltyPointsValue').get(function() {
    return this.loyaltyPointsEarned * 1000; // 1 point = 1,000 VND
});

// Xóa tất cả các indexes cũ và tạo lại
orderSchema.pre('save', async function() {
    try {
        await this.collection.dropIndexes();
    } catch (error) {
        console.log('No indexes to drop');
    }
});

// Index để tối ưu tìm kiếm
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ currentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
