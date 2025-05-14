import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/currencyFormatter';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/discount/valid`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setDiscounts(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch discounts. Please try again later.');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDiscounts();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxMC4wMzcgMCAxOC04LjA1OSAxOC0xOHMtNy45NjMtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6Ii8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/70 to-black/80 z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Exclusive Discounts</span>
                <span className="block text-blue-400">For Our Members</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Sign in to access our exclusive discount codes and save on your next purchase.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxMC4wMzcgMCAxOC04LjA1OSAxOC0xOHMtNy45NjMtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6Ii8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/70 to-black/80 z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Exclusive Discounts</span>
              <span className="block text-blue-400">Save More Today</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover our latest discount codes and save on your next purchase. Limited time offers available!
            </p>
          </div>
        </div>
      </div>

      {/* Discount Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <div
              key={discount.code}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">{discount.code}</h3>
                  <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {discount.discountValue}% OFF
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">
                    Remaining uses: {discount.remainingUses} of {discount.totalUses}
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(discount.code);
                      alert('Discount code copied to clipboard!');
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discounts; 