const { provinces, districts, wards } = require('vietnam-provinces');

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