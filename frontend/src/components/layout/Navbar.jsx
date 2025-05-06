import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  TechStation
                </span>
              </Link>
              
              {/* Desktop Menu Items */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Trang chủ
                </Link>
                <div className="relative group">
                  <button className="text-gray-700 group-hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors inline-flex items-center">
                    Máy tính
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/products/pc" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">PC Gaming</Link>
                    <Link to="/products/laptop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Laptop</Link>
                  </div>
                </div>
                <div className="relative group">
                  <button className="text-gray-700 group-hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors inline-flex items-center">
                    Linh kiện
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/products/cpu" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">CPU</Link>
                    <Link to="/products/gpu" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">GPU</Link>
                    <Link to="/products/ram" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">RAM</Link>
                    <Link to="/products/storage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ổ cứng</Link>
                  </div>
                </div>
                <Link to="/products/deals" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Khuyến mãi
                </Link>
              </div>
            </div>

            {/* Search, Auth, and Cart */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Auth Buttons or User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm font-medium">Xin chào, {user.fullName}</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Thông tin tài khoản
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Đơn hàng của tôi
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="py-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Xin chào, {user.fullName}
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      Thông tin tài khoản
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg border border-gray-300"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile Menu Items */}
              <div className="space-y-1">
                <Link
                  to="/"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Trang chủ
                </Link>
                <div className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-gray-700">Máy tính</div>
                  <Link
                    to="/products/pc"
                    className="block px-6 py-2 text-base text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    PC Gaming
                  </Link>
                  <Link
                    to="/products/laptop"
                    className="block px-6 py-2 text-base text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Laptop
                  </Link>
                </div>
                <div className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-gray-700">Linh kiện</div>
                  <Link
                    to="/products/cpu"
                    className="block px-6 py-2 text-base text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    CPU
                  </Link>
                  <Link
                    to="/products/gpu"
                    className="block px-6 py-2 text-base text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    GPU
                  </Link>
                  <Link
                    to="/products/ram"
                    className="block px-6 py-2 text-base text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    RAM
                  </Link>
                  <Link
                    to="/products/storage"
                    className="block px-6 py-2 text-base text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Ổ cứng
                  </Link>
                </div>
                <Link
                  to="/products/deals"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Khuyến mãi
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar; 