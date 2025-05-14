import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import orderService from '../services/orderService';
import { formatVND } from '../utils/currencyFormatter';
import api from '../services/api';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { getProfile } = useProfile();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validDiscounts, setValidDiscounts] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Address selection states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Guest checkout form
  const [guestForm, setGuestForm] = useState({
    email: '',
    fullName: '',
    address: {
      name: 'Home',
      street: '',
      ward: '',
      district: '',
      city: ''
    }
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
      loadValidDiscounts();
    } else {
      // Fetch provinces for guest checkout
      fetchProvinces();
    }
  }, [isAuthenticated]);

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      const response = await api.get('/api/address/provinces');
      setProvinces(response.data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinces([]);
    }
  };

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await api.get(`/api/address/districts/${selectedProvince}`);
          setDistricts(response.data);
          setWards([]); // Reset wards when district changes
          setGuestForm(prev => ({
            ...prev,
            address: {
              ...prev.address,
              district: '',
              ward: ''
            }
          }));
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await api.get(`/api/address/wards/${selectedDistrict}`);
          setWards(response.data);
          setSelectedWard(''); // Reset selected ward
          setGuestForm(prev => ({
            ...prev,
            address: {
              ...prev.address,
              ward: ''
            }
          }));
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      } else {
        setWards([]);
        setSelectedWard('');
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  const loadUserData = async () => {
    try {
      const profile = await getProfile();
      setAddresses(profile.addresses || []);
      if (profile.addresses?.length > 0) {
        setSelectedAddress(profile.addresses[0]._id);
      }

      // Load loyalty points
      const pointsData = await orderService.getLoyaltyPoints();
      setLoyaltyPoints(pointsData.data.currentPoints || 0);
    } catch (err) {
      setError('Error loading user data');
      console.error(err);
    }
  };

  const loadValidDiscounts = async () => {
    try {
      const response = await api.get('/api/discount/valid');
      setValidDiscounts(response.data.data || []);
    } catch (error) {
      console.error('Error loading valid discounts:', error);
    }
  };

  const handleGuestInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGuestForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setGuestForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    const province = provinces.find(p => p.code === provinceCode);
    setGuestForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: province ? province.name : '',
        district: '',
        ward: ''
      }
    }));
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    const district = districts.find(d => String(d.code) === String(districtCode));
    setGuestForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district: district ? district.name : '',
        ward: ''
      }
    }));
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);
    const ward = wards.find(w => String(w.code) === String(wardCode));
    setGuestForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ward: ward ? ward.name : ''
      }
    }));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const response = await api.post('/api/discount/validate', {
        code: discountCode,
        totalAmount: getCartTotal()
      });

      if (response.data.isValid) {
        setDiscountAmount(response.data.savings);
        setAppliedDiscount({
          code: discountCode,
          discountValue: response.data.discountValue,
          savings: response.data.savings
        });
        toast.success('Áp dụng mã giảm giá thành công!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setDiscountAmount(0);
      setAppliedDiscount(null);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
    setAppliedDiscount(null);
  };

  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    if (points <= loyaltyPoints) {
      setUsedPoints(points);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderItems = cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity
      }));

      let response;
      if (isAuthenticated) {
        response = await orderService.createOrder({
          items: orderItems,
          shippingAddressId: selectedAddress,
          paymentMethod,
          discountCode: appliedDiscount?.code,
          loyaltyPointsUsed: usedPoints
        });
      } else {
        // For guest orders, use the selected address details
        response = await orderService.createGuestOrder({
          items: orderItems,
          email: guestForm.email,
          fullName: guestForm.fullName,
          shippingAddress: guestForm.address,
          paymentMethod
        });
      }

      // Clear cart after successful order
      clearCart();
      
      // Redirect to success page with order ID
      navigate(`/order-success/${response.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            {isAuthenticated ? (
              // Logged in user form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Address</label>
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  >
                    {addresses.map(address => (
                      <option key={address._id} value={address._id}>
                        {address.street}, {address.ward}, {address.district}, {address.city}
                      </option>
                    ))}
                  </select>
                </div>

                {loyaltyPoints > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Use Loyalty Points ({loyaltyPoints} points available)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={loyaltyPoints}
                      value={usedPoints}
                      onChange={handlePointsChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Guest form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={guestForm.email}
                    onChange={handleGuestInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={guestForm.fullName}
                    onChange={handleGuestInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>

                {/* City/Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City/Province
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  >
                    <option value="">Select City/Province</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ward
                  </label>
                  <select
                    value={selectedWard}
                    onChange={handleWardChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    type="text"
                    name="address.street"
                    value={guestForm.address.street}
                    onChange={handleGuestInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Discount Code Section */}
          {isAuthenticated && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mã giảm giá</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 rounded-md border-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Áp dụng
                  </button>
                </div>

                {appliedDiscount && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Mã giảm giá: {appliedDiscount.code}</span>
                      <span className="text-green-600">-{formatVND(appliedDiscount.savings)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="text-sm text-red-600 hover:text-red-800 mt-2"
                    >
                      Xóa mã giảm giá
                    </button>
                  </div>
                )}

                {validDiscounts.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Mã giảm giá có sẵn:</h3>
                    <div className="space-y-2">
                      {validDiscounts.map((discount) => (
                        <div
                          key={discount.code}
                          className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setDiscountCode(discount.code);
                            handleApplyDiscount();
                          }}
                        >
                          {discount.code} - Giảm {discount.discountValue}% (Còn {discount.remainingUses} lượt)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loyalty Points Section */}
          {isAuthenticated && loyaltyPoints > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Điểm thưởng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sử dụng điểm thưởng ({loyaltyPoints} điểm = {formatVND(loyaltyPoints * 1000)})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={loyaltyPoints}
                    value={usedPoints}
                    onChange={handlePointsChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Giá trị quy đổi: {formatVND(usedPoints * 1000)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">Cash on Delivery</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="banking"
                    checked={paymentMethod === 'banking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">Bank Transfer</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio"
                  />
                  <span className="ml-2">MoMo</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Unit Price: {formatVND(item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatVND(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatVND(getCartTotal())}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}

                {usedPoints > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>-{formatVND(usedPoints * 1000)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{getCartTotal() > 5000000 ? 'Free' : formatVND(50000)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {formatVND(
                      getCartTotal() - discountAmount - (usedPoints * 1000) + 
                      (getCartTotal() > 5000000 ? 0 : 50000)
                    )}
                  </span>
                </div>

                {getCartTotal() > 5000000 && (
                  <p className="text-green-600 text-sm text-center mt-2">
                    ✨ You've qualified for free shipping! ✨
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Place Order'
              )}
            </button>

            {error && (
              <p className="mt-4 text-center text-red-600 text-sm">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage; 