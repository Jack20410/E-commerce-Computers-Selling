import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaStar } from 'react-icons/fa';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const isGoogleUser = !!user?.googleId;
  const { 
    loading, 
    error, 
    success, 
    getProfile, 
    updateProfile, 
    changePassword, 
    checkFirstLogin,
    recoverPassword,
    clearMessages 
  } = useProfile();

  const [activeTab, setActiveTab] = useState('profile');
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

  const [recoveryEmail, setRecoveryEmail] = useState('');
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
      console.log('Fetching addresses with token:', token);
      const response = await axios.get(
        'http://localhost:3001/api/address/user-addresses',
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Addresses response:', response.data);
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
      const response = await axios.get('/api/address/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await axios.get(`/api/address/districts/${provinceCode}`);
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await axios.get(`/api/address/wards/${districtCode}`);
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
          confirmPassword: 'Mật khẩu xác nhận không khớp'
        }));
      } else if (name === 'newPassword' && value !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Mật khẩu xác nhận không khớp'
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
        alert('Có lỗi xảy ra khi cập nhật thông tin');
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
        currentPassword: 'Vui lòng nhập mật khẩu hiện tại'
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
        confirmPassword: 'Mật khẩu xác nhận không khớp'
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
                currentPassword: 'Mật khẩu hiện tại không đúng'
              }));
            } else if (error.response.data.message.includes('password strength')) {
              setPasswordErrors(prev => ({
                ...prev,
                newPassword: 'Mật khẩu mới không đủ mạnh'
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
              general: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại'
            }));
            break;
          default:
            setPasswordErrors(prev => ({
              ...prev,
              general: 'Có lỗi xảy ra khi đổi mật khẩu'
            }));
        }
      } else {
        setPasswordErrors(prev => ({
          ...prev,
          general: 'Không thể kết nối đến server'
        }));
      }
    }
  };

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    
    if (!recoveryEmail) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      await recoverPassword(recoveryEmail);
      setSuccess('Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      setRecoveryEmail('');
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Email không tồn tại trong hệ thống');
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục mật khẩu');
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

      const response = await axios.post(
        'http://localhost:3001/api/address/add', 
        addressToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
        alert('Có lỗi xảy ra khi thêm địa chỉ');
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

      const response = await axios.put(
        `http://localhost:3001/api/address/update/${editingAddress._id}`,
        addressToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
        alert('Có lỗi xảy ra khi cập nhật địa chỉ');
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

      const response = await axios.delete(
        `http://localhost:3001/api/address/delete/${addressId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
        alert('Có lỗi xảy ra khi xóa địa chỉ');
      }
    } finally {
      setIsAddressLoading(false);
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
              {!isGoogleUser && (
                <button
                  onClick={() => !isFirstLogin && setActiveTab('recover-password')}
                  className={`${
                    activeTab === 'recover-password'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${
                    isFirstLogin ? 'opacity-50 cursor-not-allowed' : ''
                  } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  disabled={isFirstLogin}
                >
                  Recover Password
                </button>
              )}
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
                Đây là lần đăng nhập đầu tiên của bạn. Vui lòng đổi mật khẩu để tiếp tục.
              </div>
            )}

            {/* Personal Information Form */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Basic Info Form */}
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

                {/* Address Management Section */}
                <div className="border-t pt-8">
                  <div className="flex justify-between items-center mb-6">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <form onSubmit={handleChangePassword} className="space-y-6">
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
            )}

            {/* Recover Password Form */}
            {!isGoogleUser && activeTab === 'recover-password' && (
              <form onSubmit={handleRecoverPassword} className="space-y-6">
                <div>
                  <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="recoveryEmail"
                    id="recoveryEmail"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className={`mt-1 block w-full rounded-md border ${
                      error ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                    placeholder="Enter your email"
                    required
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {loading ? 'Sending...' : 'Send New Password'}
                  </button>
                </div>
              </form>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 