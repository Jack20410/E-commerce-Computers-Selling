import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Lấy thông tin profile
  const getProfile = async () => {
    if (!isAuthenticated || !token) {
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/profile');
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin profile
  const updateProfile = async (data) => {
    if (!isAuthenticated || !token) {
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Sending profile update request:', data);
      const response = await api.patch('/users/update-profile', { 
        fullName: data.fullName 
      });
      console.log('Profile update response:', response.data);
      setSuccess(response.data.message);
      return response.data.user;
    } catch (err) {
      console.error('Profile update error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đổi mật khẩu
  const changePassword = async (currentPassword, newPassword) => {
    if (!isAuthenticated || !token) {
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess(response.data.message);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra đăng nhập lần đầu
  const checkFirstLogin = async () => {
    if (!isAuthenticated || !token) {
      throw new Error('Vui lòng đăng nhập để tiếp tục');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/check-first-login');
      return response.data.isFirstLogin;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Khôi phục mật khẩu
  const recoverPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/users/recover-password', { email });
      setSuccess(response.data.message);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const value = {
    loading,
    error,
    success,
    getProfile,
    updateProfile,
    changePassword,
    checkFirstLogin,
    recoverPassword,
    clearMessages
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext; 