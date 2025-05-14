import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthBanner from '../../components/ui/AuthBanner';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Validate email
    if (!email) {
      setStatus({
        type: 'error',
        message: 'Vui lòng nhập email'
      });
      return;
    }

    if (!validateEmail(email)) {
      setStatus({
        type: 'error',
        message: 'Email không hợp lệ'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/users/recover-password', { email });
      const data = response.data;

      setStatus({
        type: 'success',
        message: 'Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
      });
      setEmail('');

      // Log trong môi trường development
      if (process.env.NODE_ENV === 'development' && data.tempPassword) {
        console.log('Temporary password:', data.tempPassword);
      }
    } catch (err) {
      let errorMessage = 'Có lỗi xảy ra khi khôi phục mật khẩu';
      
      if (err.message.includes('không tồn tại')) {
        errorMessage = 'Email không tồn tại trong hệ thống';
      } else if (err.message.includes('không thể gửi email')) {
        errorMessage = 'Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau';
      }

      setStatus({
        type: 'error',
        message: errorMessage
      });

      console.error('Error in password recovery:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Banner */}
      <div className="hidden lg:block lg:w-1/2 xl:w-2/3">
        <AuthBanner />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6 py-8">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Khôi phục mật khẩu
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Hoặc{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  quay lại đăng nhập
                </Link>
              </p>
            </div>

            {status.message && (
              <div className={`mb-4 p-3 rounded-md text-sm ${
                status.type === 'error' 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-green-50 text-green-500'
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear status when user starts typing
                      if (status.message) {
                        setStatus({ type: '', message: '' });
                      }
                    }}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      status.type === 'error' ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isLoading ? 'Đang xử lý...' : 'Gửi mật khẩu mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 