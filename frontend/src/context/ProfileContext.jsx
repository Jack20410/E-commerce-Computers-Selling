import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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

  // Tạo instance axios với cấu hình mặc định
  const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Thêm interceptor để tự động thêm token vào header
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Xử lý lỗi chung
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      return Promise.reject(error);
    }
  );

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
      const response = await api.put('/users/update-profile', data);
      setSuccess(response.data.message);
      return response.data.user;
    } catch (err) {
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