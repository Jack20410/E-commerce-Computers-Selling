const Discount = require('../Models/discount.model');

// Tạo mã giảm giá mới
exports.createDiscount = async (req, res) => {
  try {
    const { discountValue, maxUses } = req.body;
    
    // Tạo code ngẫu nhiên và kiểm tra trùng lặp
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = Discount.generateCode();
      const existingDiscount = await Discount.findOne({ code });
      if (!existingDiscount) {
        isUnique = true;
      }
    }

    const discount = new Discount({
      code,
      discountValue,
      maxUses
    });

    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách mã giảm giá
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('orders', 'orderNumber totalAmount createdAt')
      .sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kiểm tra và áp dụng mã giảm giá
exports.validateDiscount = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    const discount = await Discount.findOne({ code });

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    if (!discount.isValid()) {
      return res.status(400).json({ 
        message: 'Discount code is not valid',
        reason: discount.currentUses >= discount.maxUses ? 'Usage limit reached' : 'Code is inactive'
      });
    }

    const discountedAmount = discount.applyDiscount(totalAmount);
    const savings = totalAmount - discountedAmount;

    res.json({
      isValid: true,
      discountValue: discount.discountValue,
      originalAmount: totalAmount,
      discountedAmount,
      savings
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái mã giảm giá
exports.updateDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    discount.isActive = isActive;
    await discount.save();

    res.json(discount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa mã giảm giá
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findById(id);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    if (discount.currentUses > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete discount code that has been used'
      });
    }

    await discount.deleteOne();
    res.json({ message: 'Discount code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách mã giảm giá còn hiệu lực
exports.getValidDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find({
      isActive: true,
      $expr: { $lt: ["$currentUses", "$maxUses"] }
    }).select('code discountValue maxUses currentUses');

    // Format response để dễ đọc hơn
    const formattedDiscounts = discounts.map(discount => ({
      code: discount.code,
      discountValue: discount.discountValue,
      remainingUses: discount.maxUses - discount.currentUses,
      totalUses: discount.maxUses
    }));

    res.json({
      success: true,
      data: formattedDiscounts
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching valid discounts',
      error: error.message 
    });
  }
}; 