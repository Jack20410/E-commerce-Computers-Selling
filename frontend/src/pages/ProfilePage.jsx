import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
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

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 số');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)');
    }
    
    return errors;
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    try {
      await updateProfile({
        fullName: personalInfo.fullName,
        address: personalInfo.address
      });
    } catch (error) {
      console.error('Error updating profile:', error);
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Address</h3>
                  
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      id="street"
                      value={personalInfo.address.street}
                      onChange={handlePersonalInfoChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-gray-700">
                      Ward
                    </label>
                    <input
                      type="text"
                      name="address.ward"
                      id="ward"
                      value={personalInfo.address.ward}
                      onChange={handlePersonalInfoChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                      District
                    </label>
                    <input
                      type="text"
                      name="address.district"
                      id="district"
                      value={personalInfo.address.district}
                      onChange={handlePersonalInfoChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      id="city"
                      value={personalInfo.address.city}
                      onChange={handlePersonalInfoChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 