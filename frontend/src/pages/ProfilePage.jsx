import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaStar } from 'react-icons/fa';
import orderService from '../services/orderService';
import websocketService from '../services/websocket.service';
import { formatVND } from '../utils/currencyFormatter';
import reviewService from '../services/reviewService';
import api from '../services/api';

const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipping: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusText = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipping: 'Shipping',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {statusText[status]}
    </span>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, token } = useAuth();
  const isGoogleUser = !!user?.googleId;
  
  // Get tab from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');

  const { 
    loading, 
    error, 
    success, 
    getProfile, 
    updateProfile, 
    changePassword, 
    checkFirstLogin,
    clearMessages 
  } = useProfile();

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    address: {
      name: '',
      street: '',
      ward: '',
      district: '',
      city: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });

  // New states for orders
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Thêm state lưu review cho từng item
  const [itemReviews, setItemReviews] = useState({}); // key: orderId+productId
  const [reviewForms, setReviewForms] = useState({}); // key: orderId+productId
  const [reviewLoadingMap, setReviewLoadingMap] = useState({});
  const [reviewErrorMap, setReviewErrorMap] = useState({});
  const [reviewSuccessMap, setReviewSuccessMap] = useState({});

  // Thêm state quản lý modal đánh giá
  const [reviewModal, setReviewModal] = useState({ open: false, orderId: null, productId: null });

  // Thêm state cho edit review
  const [editingReviewKey, setEditingReviewKey] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });
  const [editReviewLoading, setEditReviewLoading] = useState(false);

  // Kiểm tra authentication và khởi tạo dữ liệu
  useEffect(() => {
    const initializeProfile = async () => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/profile' } });
        return;
      }

      if (!isInitialized) {
        try {
          // Kiểm tra first login trước
          const isFirst = await checkFirstLogin();
          setIsFirstLogin(isFirst);
          
          if (isFirst) {
            setActiveTab('change-password');
          } else {
            // Chỉ lấy profile nếu không phải first login
            const profileData = await getProfile();
            setPersonalInfo({
              fullName: profileData.fullName,
              email: profileData.email,
              address: profileData.addresses[0] || {
                street: '',
                ward: '',
                district: '',
                city: ''
              }
            });
          }
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing profile:', error);
        }
      }
    };

    initializeProfile();
  }, [isAuthenticated, isInitialized]);

  // Clear messages khi chuyển tab
  useEffect(() => {
    clearMessages();
  }, [activeTab]);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  const fetchAddresses = async () => {
    try {
      if (!token) return;
      
      const response = await api.get('/api/address/user-addresses', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/api/address/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await api.get(`/api/address/districts/${provinceCode}`);
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await api.get(`/api/address/wards/${districtCode}`);
      setWards(response.data);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  // Handle personal info change
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPersonalInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPersonalInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate password
  const validatePassword = (password) => {
    const minLength = 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const errors = [];
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasLetter) {
      errors.push('Password must contain at least one letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset error for this field
    setPasswordErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));

    // Validate new password when it changes
    if (name === 'newPassword') {
      const errors = validatePassword(value);
      if (errors.length > 0) {
        setPasswordErrors(prev => ({
          ...prev,
          newPassword: errors.join(', ')
        }));
      }
    }

    // Check password confirmation match
    if (name === 'confirmPassword' || (name === 'newPassword' && passwordData.confirmPassword)) {
      if (name === 'confirmPassword' && value !== passwordData.newPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Password confirmation does not match'
        }));
      } else if (name === 'newPassword' && value !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Password confirmation does not match'
        }));
      }
    }
  };

  // Handle update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName: personalInfo.fullName
      });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred while updating your information');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    // Reset all errors
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    });

    // Validate current password
    if (!passwordData.currentPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        currentPassword: 'Please enter your current password'
      }));
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(passwordData.newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(prev => ({
        ...prev,
        newPassword: newPasswordErrors.join(', ')
      }));
      return;
    }

    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        confirmPassword: 'Password confirmation does not match'
      }));
      return;
    }

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (isFirstLogin) {
        setIsFirstLogin(false);
        setActiveTab('profile');
        // Sau khi đổi mật khẩu thành công, lấy thông tin profile
        const profileData = await getProfile();
        setPersonalInfo({
          fullName: profileData.fullName,
          email: profileData.email,
          address: profileData.addresses[0] || {
            street: '',
            ward: '',
            district: '',
            city: ''
          }
        });
      }
    } catch (error) {
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.message.includes('current password')) {
              setPasswordErrors(prev => ({
                ...prev,
                currentPassword: 'Current password is incorrect'
              }));
            } else if (error.response.data.message.includes('password strength')) {
              setPasswordErrors(prev => ({
                ...prev,
                newPassword: 'New password is not strong enough'
              }));
            } else {
              setPasswordErrors(prev => ({
                ...prev,
                general: error.response.data.message
              }));
            }
            break;
          case 401:
            setPasswordErrors(prev => ({
              ...prev,
              general: 'Session expired. Please log in again.'
            }));
            break;
          default:
            setPasswordErrors(prev => ({
              ...prev,
              general: 'An error occurred while changing password'
            }));
        }
      } else {
        setPasswordErrors(prev => ({
          ...prev,
          general: 'Cannot connect to server'
        }));
      }
    }
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    fetchDistricts(provinceCode);
    if (isAddingAddress) {
      setNewAddress(prev => ({
        ...prev,
        city: provinceCode,
        district: '',
        ward: ''
      }));
    } else if (editingAddress) {
      setEditingAddress(prev => ({
        ...prev,
        city: provinceCode,
        district: '',
        ward: ''
      }));
    }
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    fetchWards(districtCode);
    if (isAddingAddress) {
      setNewAddress(prev => ({
        ...prev,
        district: districtCode,
        ward: ''
      }));
    } else if (editingAddress) {
      setEditingAddress(prev => ({
        ...prev,
        district: districtCode,
        ward: ''
      }));
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    if (isAddingAddress) {
      setNewAddress(prev => ({
        ...prev,
        ward: wardCode
      }));
    } else if (editingAddress) {
      setEditingAddress(prev => ({
        ...prev,
        ward: wardCode
      }));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsAddressLoading(true);
    try {
      // Lấy tên từ code trước khi gửi lên server
      const wardObj = wards.find(w => String(w.code) === String(newAddress.ward));
      const districtObj = districts.find(d => String(d.code) === String(newAddress.district));
      const provinceObj = provinces.find(p => String(p.code) === String(newAddress.city));
      
      const addressToSend = {
        ...newAddress,
        ward: wardObj ? wardObj.name : '',
        district: districtObj ? districtObj.name : '',
        city: provinceObj ? provinceObj.name : ''
      };

      console.log('Sending address data:', addressToSend);
      console.log('Token:', token);

      const response = await api.post('/api/address/add', addressToSend, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);
      await fetchAddresses();
      setIsAddingAddress(false);
      setNewAddress({
        name: '',
        street: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred while adding address');
      }
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setIsAddressLoading(true);
    try {
      // Lấy tên từ code trước khi gửi lên server
      const wardObj = wards.find(w => String(w.code) === String(editingAddress.ward));
      const districtObj = districts.find(d => String(d.code) === String(editingAddress.district));
      const provinceObj = provinces.find(p => String(p.code) === String(editingAddress.city));
      
      const addressToSend = {
        ...editingAddress,
        ward: wardObj ? wardObj.name : '',
        district: districtObj ? districtObj.name : '',
        city: provinceObj ? provinceObj.name : ''
      };

      console.log('Sending update data:', addressToSend);
      console.log('Token:', token);

      const response = await api.put(`/api/address/update/${editingAddress._id}`, addressToSend, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);
      await fetchAddresses();
      setEditingAddress(null);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred while updating address');
      }
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setIsAddressLoading(true);
    try {
      console.log('Deleting address:', addressId);
      console.log('Token:', token);

      const response = await api.delete(`/api/address/delete/${addressId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);
      await fetchAddresses();
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred while deleting address');
      }
    } finally {
      setIsAddressLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket when authenticated
      websocketService.connect(token);
      
      // Subscribe to order updates
      websocketService.subscribeToOrderUpdates((data) => {
        if (data.userId === user?._id) {
          // Update order in the list
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === data.orderId 
                ? { ...order, currentStatus: data.newStatus }
                : order
            )
          );
        }
      });

      // Cleanup on unmount
      return () => {
        websocketService.unsubscribeFromOrderUpdates();
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated, user, token]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!token) return;
    
    setOrderLoading(true);
    setOrderError(null);
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.data.orders);
    } catch (error) {
      setOrderError('Error fetching orders');
      console.error(error);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'my-orders' && token) {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab, token]);

  // Hàm fetch review cho từng item
  const fetchItemReview = async (orderId, productId, userName) => {
    try {
      const review = await reviewService.getUserReview(productId, userName, orderId);
      setItemReviews(prev => ({ ...prev, [`${orderId}_${productId}`]: review }));
    } catch {
      setItemReviews(prev => ({ ...prev, [`${orderId}_${productId}`]: null }));
    }
  };

  // Khi orders thay đổi, fetch review cho từng item nếu Delivered
  useEffect(() => {
    if (!orders || !user) return;
    orders.forEach(order => {
      if (order.currentStatus === 'delivered') {
        order.items.forEach(item => {
          fetchItemReview(order._id, item.product, user.fullName || user.email);
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, user]);

  // Hàm submit review cho item
  const handleItemReviewSubmit = async (orderId, productId) => {
    const form = reviewForms[`${orderId}_${productId}`] || {};
    const userName = (form.userName || user.fullName || user.email || '').trim();
    const rating = form.rating || 5;
    const comment = form.comment || '';
    if (!userName) {
      setReviewErrorMap(prev => ({ ...prev, [`${orderId}_${productId}`]: 'Vui lòng nhập tên của bạn' }));
      return;
    }
    setReviewLoadingMap(prev => ({ ...prev, [`${orderId}_${productId}`]: true }));
    setReviewErrorMap(prev => ({ ...prev, [`${orderId}_${productId}`]: '' }));
    setReviewSuccessMap(prev => ({ ...prev, [`${orderId}_${productId}`]: '' }));
    try {
      await reviewService.createReview({
        productId,
        orderId,
        userName,
        rating,
        comment
      });
      setReviewSuccessMap(prev => ({ ...prev, [`${orderId}_${productId}`]: 'Đánh giá thành công!' }));
      fetchItemReview(orderId, productId, userName);
      setReviewForms(prev => ({ ...prev, [`${orderId}_${productId}`]: { userName: '', rating: 5, comment: '' } }));
    } catch (err) {
      setReviewErrorMap(prev => ({ ...prev, [`${orderId}_${productId}`]: err.message || 'Gửi đánh giá thất bại' }));
    } finally {
      setReviewLoadingMap(prev => ({ ...prev, [`${orderId}_${productId}`]: false }));
    }
  };

  // Hàm mở modal đánh giá
  const openReviewModal = (orderId, productId) => {
    setReviewModal({ open: true, orderId, productId });
  };
  // Hàm đóng modal đánh giá
  const closeReviewModal = () => {
    setReviewModal({ open: false, orderId: null, productId: null });
  };

  // Hàm bắt đầu sửa review
  const startEditReview = (reviewKey) => {
    setEditingReviewKey(reviewKey);
    setEditReviewForm({
      rating: itemReviews[reviewKey]?.rating || 5,
      comment: itemReviews[reviewKey]?.comment || ''
    });
  };
  // Huỷ sửa
  const cancelEditReview = () => {
    setEditingReviewKey(null);
    setEditReviewForm({ rating: 5, comment: '' });
  };
  // Lưu sửa
  const handleEditReviewSubmit = async (reviewId, reviewKey) => {
    setEditReviewLoading(true);
    try {
      const updated = await reviewService.updateReview(reviewId, {
        rating: editReviewForm.rating,
        comment: editReviewForm.comment
      });
      setItemReviews(prev => ({
        ...prev,
        [reviewKey]: updated.data
      }));
      setEditingReviewKey(null);
      setEditReviewForm({ rating: 5, comment: '' });
      closeReviewModal();
    } catch (err) {
      alert('Cập nhật đánh giá thất bại!');
    } finally {
      setEditReviewLoading(false);
    }
  };
  // Xoá review
  const handleDeleteReview = async (reviewId, reviewKey) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đánh giá này?')) return;
    setEditReviewLoading(true);
    try {
      await reviewService.deleteReview(reviewId);
      setItemReviews(prev => ({ ...prev, [reviewKey]: null }));
      setEditingReviewKey(null);
      setEditReviewForm({ rating: 5, comment: '' });
      closeReviewModal();
    } catch (err) {
      alert('Xoá đánh giá thất bại!');
    } finally {
      setEditReviewLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => !isFirstLogin && setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${
                  isFirstLogin ? 'opacity-50 cursor-not-allowed' : ''
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                disabled={isFirstLogin}
              >
                Personal Info
              </button>
              {!isGoogleUser && (
                <button
                  onClick={() => setActiveTab('change-password')}
                  className={`${
                    activeTab === 'change-password'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Change Password
                </button>
              )}
              <button
                onClick={() => !isFirstLogin && setActiveTab('my-orders')}
                className={`${
                  activeTab === 'my-orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${
                  isFirstLogin ? 'opacity-50 cursor-not-allowed' : ''
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                disabled={isFirstLogin}
              >
                My Orders
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-500 rounded-md text-sm">
                {success}
              </div>
            )}
            {isFirstLogin && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-600 rounded-md">
                This is your first login. Please change your password to continue.
              </div>
            )}

            {/* Personal Information Form */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info Form - Left Column */}
                <div className="space-y-6 max-w-md">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={personalInfo.fullName}
                        onChange={handlePersonalInfoChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={personalInfo.email}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-gray-50"
                        disabled
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {loading ? 'Updating...' : 'Update Info'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Address Management Section - Right Column */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">My Addresses</h3>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaPlus className="mr-2" />
                      Add New Address
                    </button>
                  </div>

                  {/* Address List */}
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`relative p-4 border rounded-lg ${
                          address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {address.isDefault && (
                          <div className="absolute top-2 right-2 text-blue-500">
                            <FaStar />
                          </div>
                        )}
                        <h3 className="font-medium text-lg">{address.name}</h3>
                        <p className="text-gray-600">{address.street}</p>
                        <p className="text-gray-600">
                          {address.ward}, {address.district}, {address.city}
                        </p>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingAddress(address)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Form */}
            {!isGoogleUser && activeTab === 'change-password' && (
              <div className="flex justify-center">
                <form onSubmit={handleChangePassword} className="space-y-6 w-full max-w-md bg-white p-8 rounded-xl shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 text-center mb-6">Change Password</h3>
                  
                  {passwordErrors.general && (
                    <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm">
                      {passwordErrors.general}
                    </div>
                  )}

                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 block w-full rounded-md border ${
                        passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 block w-full rounded-md border ${
                        passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`mt-1 block w-full rounded-md border ${
                        passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || Object.values(passwordErrors).some(error => error !== '')}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading || Object.values(passwordErrors).some(error => error !== '')
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address Form Modal */}
            {(isAddingAddress || editingAddress) && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-medium mb-4">
                    {isAddingAddress ? 'Add New Address' : 'Edit Address'}
                  </h3>
                  <form onSubmit={isAddingAddress ? handleAddAddress : handleUpdateAddress} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Name</label>
                      <input
                        type="text"
                        value={isAddingAddress ? newAddress.name : editingAddress.name}
                        onChange={(e) => {
                          if (isAddingAddress) {
                            setNewAddress(prev => ({ ...prev, name: e.target.value }));
                          } else {
                            setEditingAddress(prev => ({ ...prev, name: e.target.value }));
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Street</label>
                      <input
                        type="text"
                        value={isAddingAddress ? newAddress.street : editingAddress.street}
                        onChange={(e) => {
                          if (isAddingAddress) {
                            setNewAddress(prev => ({ ...prev, street: e.target.value }));
                          } else {
                            setEditingAddress(prev => ({ ...prev, street: e.target.value }));
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {/* City/Province */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City/Province</label>
                      <select
                        value={isAddingAddress ? newAddress.city : editingAddress.city}
                        onChange={handleProvinceChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700">District</label>
                      <select
                        value={isAddingAddress ? newAddress.district : editingAddress.district}
                        onChange={handleDistrictChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        disabled={!((isAddingAddress ? newAddress.city : editingAddress.city))}
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
                      <label className="block text-sm font-medium text-gray-700">Ward</label>
                      <select
                        value={isAddingAddress ? newAddress.ward : editingAddress.ward}
                        onChange={handleWardChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        disabled={!((isAddingAddress ? newAddress.district : editingAddress.district))}
                      >
                        <option value="">Select Ward</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={isAddingAddress ? newAddress.isDefault : editingAddress.isDefault}
                        onChange={(e) => {
                          if (isAddingAddress) {
                            setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }));
                          } else {
                            setEditingAddress(prev => ({ ...prev, isDefault: e.target.checked }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                        Set as default address
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAddingAddress) {
                            setIsAddingAddress(false);
                            setNewAddress({
                              name: '',
                              street: '',
                              ward: '',
                              district: '',
                              city: '',
                              isDefault: false
                            });
                          } else {
                            setEditingAddress(null);
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddressLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isAddressLoading ? (isAddingAddress ? 'Adding...' : 'Updating...') : (isAddingAddress ? 'Add Address' : 'Update Address')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* My Orders Content */}
            {activeTab === 'my-orders' && (
              <div className="space-y-6">
                {orderError && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    {orderError}
                  </div>
                )}

                {orderLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">You have no orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Order ID: {order._id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Order Date: {new Date(order.createdAt).toLocaleDateString('en-US')}
                            </p>
                          </div>
                          <OrderStatusBadge status={order.currentStatus} />
                        </div>

                        <div className="space-y-4">
                          {order.items.map((item) => {
                            const productId = item.product;
                            const reviewKey = `${order._id}_${productId}`;
                            const hasReview = !!itemReviews[reviewKey];
                            return (
                              <div key={item._id} className="flex items-center space-x-4">
                                <img
                                  src={`http://localhost:3001${item.productSnapshot.image}`}
                                  alt={item.productSnapshot.name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.productSnapshot.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {formatVND(item.price * item.quantity)}
                                  </p>
                                  {order.currentStatus === 'delivered' && (
                                    <div className="mt-2">
                                      {hasReview ? (
                                        <>
                                          {editingReviewKey === reviewKey ? (
                                            <form
                                              onSubmit={e => {
                                                e.preventDefault();
                                                handleEditReviewSubmit(itemReviews[reviewKey]._id, reviewKey);
                                              }}
                                              className="flex flex-col gap-3"
                                            >
                                              <div className="flex items-center gap-1">
                                                {[1,2,3,4,5].map(star => (
                                                  <button
                                                    type="button"
                                                    key={star}
                                                    className="focus:outline-none"
                                                    onClick={() => setEditReviewForm(prev => ({ ...prev, rating: star }))}
                                                  >
                                                    <svg className={`w-6 h-6 ${star <= (editReviewForm.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                  </button>
                                                ))}
                                              </div>
                                              <textarea
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                                placeholder="Viết bình luận..."
                                                value={editReviewForm.comment}
                                                onChange={e => setEditReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                                required
                                                rows={3}
                                              />
                                              <div className="flex gap-2 items-center">
                                                <button
                                                  type="submit"
                                                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
                                                  disabled={editReviewLoading}
                                                >
                                                  {editReviewLoading ? 'Đang lưu...' : 'Lưu'}
                                                </button>
                                                <button
                                                  type="button"
                                                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                  onClick={cancelEditReview}
                                                  disabled={editReviewLoading}
                                                >
                                                  Huỷ
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            <div className="border border-green-400 bg-green-100 rounded-lg p-4 shadow flex items-start gap-4">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-semibold text-blue-700">{itemReviews[reviewKey].userName}</span>
                                                  <span className="text-xs text-gray-400">
                                                    {itemReviews[reviewKey].createdAt ? new Date(itemReviews[reviewKey].createdAt).toLocaleDateString('vi-VN') : ""}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                  {[1,2,3,4,5].map(star => (
                                                    <svg key={star} className={`w-5 h-5 ${star <= itemReviews[reviewKey].rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                  ))}
                                                </div>
                                                <div className="text-gray-700 text-base whitespace-pre-line break-words">{itemReviews[reviewKey].comment}</div>
                                                {(user.fullName === itemReviews[reviewKey].userName || user.email === itemReviews[reviewKey].userName) && (
                                                  <div className="flex gap-2 mt-3">
                                                    <button
                                                      className="px-3 py-1 rounded bg-yellow-400 text-white text-sm font-medium hover:bg-yellow-500"
                                                      onClick={() => startEditReview(reviewKey)}
                                                    >
                                                      Edit
                                                    </button>
                                                    <button
                                                      className="px-3 py-1 rounded bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                                                      onClick={() => handleDeleteReview(itemReviews[reviewKey]._id, reviewKey)}
                                                      disabled={editReviewLoading}
                                                    >
                                                      Delete
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <button
                                          className="mt-2 px-4 py-1 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 shadow"
                                          onClick={() => openReviewModal(order._id, productId)}
                                        >
                                          Review
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                Payment method: {
                                  {
                                    cod: 'Cash on Delivery',
                                    banking: 'Bank Transfer',
                                    momo: 'MoMo Wallet'
                                  }[order.paymentMethod]
                                }
                              </p>
                              {order.loyaltyPointsEarned > 0 && (
                                <p className="text-sm text-green-600">
                                  Points earned: +{order.loyaltyPointsEarned}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="text-lg font-bold text-blue-600">
                                {formatVND(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status History */}
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Status History</h4>
                          <div className="space-y-2">
                            {order.statusHistory.map((status, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <div className="w-32">
                                  {new Date(status.timestamp).toLocaleString('en-US')}
                                </div>
                                <OrderStatusBadge status={status.status} />
                                {status.note && (
                                  <span className="ml-2 text-gray-500">{status.note}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal đánh giá sản phẩm */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={closeReviewModal}
            >
              ×
            </button>
            {/* Lấy thông tin order và item */}
            {(() => {
              const order = orders.find(o => o._id === reviewModal.orderId);
              if (!order) return null;
              const item = order.items.find(i => i.product === reviewModal.productId);
              if (!item) return null;
              const reviewKey = `${order._id}_${item.product}`;
              const hasReview = !!itemReviews[reviewKey];
              return (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img src={`http://localhost:3001${item.productSnapshot.image}`} alt={item.productSnapshot.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h4 className="font-semibold text-lg">{item.productSnapshot.name}</h4>
                      <p className="text-gray-500 text-sm">{formatVND(item.price * item.quantity)}</p>
                    </div>
                  </div>
                  {hasReview ? (
                    <>
                      {editingReviewKey === reviewKey ? (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            handleEditReviewSubmit(itemReviews[reviewKey]._id, reviewKey);
                          }}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(star => (
                              <button
                                type="button"
                                key={star}
                                className="focus:outline-none"
                                onClick={() => setEditReviewForm(prev => ({ ...prev, rating: star }))}
                              >
                                <svg className={`w-6 h-6 ${star <= (editReviewForm.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                            placeholder="Viết bình luận..."
                            value={editReviewForm.comment}
                            onChange={e => setEditReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            required
                            rows={3}
                          />
                          <div className="flex gap-2 items-center">
                            <button
                              type="submit"
                              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
                              disabled={editReviewLoading}
                            >
                              {editReviewLoading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={cancelEditReview}
                              disabled={editReviewLoading}
                            >
                              Huỷ
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="border border-green-400 bg-green-100 rounded-lg p-4 shadow flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-blue-700">{itemReviews[reviewKey].userName}</span>
                              <span className="text-xs text-gray-400">
                                {itemReviews[reviewKey].createdAt ? new Date(itemReviews[reviewKey].createdAt).toLocaleDateString('vi-VN') : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1,2,3,4,5].map(star => (
                                <svg key={star} className={`w-5 h-5 ${star <= itemReviews[reviewKey].rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              ))}
                            </div>
                            <div className="text-gray-700 text-base whitespace-pre-line break-words">{itemReviews[reviewKey].comment}</div>
                            {(user.fullName === itemReviews[reviewKey].userName || user.email === itemReviews[reviewKey].userName) && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  className="px-3 py-1 rounded bg-yellow-400 text-white text-sm font-medium hover:bg-yellow-500"
                                  onClick={() => startEditReview(reviewKey)}
                                >
                                  Sửa
                                </button>
                                <button
                                  className="px-3 py-1 rounded bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                                  onClick={() => handleDeleteReview(itemReviews[reviewKey]._id, reviewKey)}
                                  disabled={editReviewLoading}
                                >
                                  Xoá
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        await handleItemReviewSubmit(order._id, item.product);
                        // Nếu gửi thành công thì đóng modal
                        if (!reviewErrorMap[reviewKey]) {
                          closeReviewModal();
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="text"
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="Tên của bạn"
                        value={reviewForms[reviewKey]?.userName || user.fullName || ''}
                        onChange={e => setReviewForms(prev => ({ ...prev, [reviewKey]: { ...prev[reviewKey], userName: e.target.value } }))}
                        required
                        style={{ minWidth: 120 }}
                      />
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <button
                            type="button"
                            key={star}
                            className="focus:outline-none"
                            onClick={() => setReviewForms(prev => ({ ...prev, [reviewKey]: { ...prev[reviewKey], rating: star } }))}
                          >
                            <svg className={`w-6 h-6 ${star <= (reviewForms[reviewKey]?.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="Viết bình luận..."
                        value={reviewForms[reviewKey]?.comment || ''}
                        onChange={e => setReviewForms(prev => ({ ...prev, [reviewKey]: { ...prev[reviewKey], comment: e.target.value } }))}
                        required
                        rows={3}
                      />
                      <div className="flex gap-2 items-center">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-60 text-sm shadow"
                          disabled={reviewLoadingMap[reviewKey]}
                        >
                          {reviewLoadingMap[reviewKey] ? 'Đang gửi...' : 'Send review'}
                        </button>
                        {reviewErrorMap[reviewKey] && <div className="text-red-500 text-sm">{reviewErrorMap[reviewKey]}</div>}
                        {reviewSuccessMap[reviewKey] && <div className="text-green-600 text-sm">{reviewSuccessMap[reviewKey]}</div>}
                      </div>
                    </form>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 