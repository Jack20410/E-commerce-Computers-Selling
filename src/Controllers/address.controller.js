const { provinces, districts, wards } = require('vietnam-provinces');
const User = require('../Models/user.model');

// Lấy danh sách tỉnh/thành phố
exports.getProvinces = (req, res) => {
  try {
    const provinceList = provinces.map(province => ({
      code: province.code,
      name: province.name
    }));
    res.json(provinceList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provinces', error: error.message });
  }
};

// Lấy danh sách quận/huyện theo tỉnh/thành phố
exports.getDistricts = (req, res) => {
  try {
    const { provinceCode } = req.params;
    console.log('Received provinceCode:', provinceCode);
    const filtered = districts.filter(district => district.province_code === provinceCode);
    console.log('Filtered districts:', filtered);
    const districtList = filtered.map(district => ({
      code: district.code,
      name: district.name
    }));
    res.json(districtList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts', error: error.message });
  }
};

// Lấy danh sách phường/xã theo quận/huyện
exports.getWards = (req, res) => {
  try {
    const { districtCode } = req.params;
    console.log('Received districtCode:', districtCode);
    const filtered = wards.filter(ward => ward.district_code === districtCode);
    console.log('Filtered wards:', filtered);
    const wardList = filtered.map(ward => ({
      code: ward.code,
      name: ward.name
    }));
    res.json(wardList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wards', error: error.message });
  }
};

// Lấy danh sách địa chỉ giao hàng của user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

// Thêm địa chỉ giao hàng mới
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, street, ward, district, city, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Nếu địa chỉ mới là mặc định, reset tất cả địa chỉ khác về false
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      name,
      street,
      ward,
      district,
      city,
      isDefault: isDefault || false
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
};

// Cập nhật địa chỉ giao hàng
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.addressId;
    const { name, street, ward, district, city, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Nếu địa chỉ được cập nhật là mặc định, reset tất cả địa chỉ khác về false
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name,
      street,
      ward,
      district,
      city,
      isDefault: isDefault || false
    };

    await user.save();
    res.json(user.addresses[addressIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};

// Xóa địa chỉ giao hàng
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Nếu xóa địa chỉ mặc định, set địa chỉ đầu tiên còn lại làm mặc định
    if (user.addresses[addressIndex].isDefault && user.addresses.length > 1) {
      const nextAddressIndex = addressIndex === 0 ? 1 : 0;
      user.addresses[nextAddressIndex].isDefault = true;
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
}; 