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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 cursor-pointer">
                  TechStation
                </span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-8">
                  <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Home</a>
                  <div className="relative group">
                    <button className="text-gray-700 group-hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-200 inline-flex items-center group-hover:scale-105">
                      Computers
                      <svg className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                      <div className="py-2 px-1">
                        <Link to="/products/pc" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Gaming PC</Link>
                        <Link to="/products/laptop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Laptop</Link>
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="text-gray-700 group-hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-200 inline-flex items-center group-hover:scale-105">
                      Components
                      <svg className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                      <div className="py-2 px-1">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">CPUs</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Motherboards</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Graphics Cards</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Storage</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Memory</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Gears</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Monitors</a>
                      </div>
                    </div>
                  </div>
                  <Link to="/products/deals" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">
                    Deals
                  </Link>
                </div>
              </div>
            </div>

            {/* Search, Auth, and Cart */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Search */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 group-hover:bg-white transition-all duration-200"
                />
                <div className="absolute left-3 top-2.5">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Auth Buttons or User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
                  >
                    <span className="text-sm font-medium">Hello, {user.fullName}</span>
                    <svg className={`h-5 w-5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 px-1 z-50 transform transition-all duration-200">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">
                        Account Info
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-all duration-200 hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition-all duration-200 hover:scale-105">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform transition-transform duration-200 hover:scale-110">
                  0
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none transition-colors duration-200"
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
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-xl">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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
                    Hi, {user.fullName}
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 font-medium rounded-lg transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Items */}
              <div className="space-y-1">
                <Link
                  to="/"
                  className="block px-4 py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                >
                  Home
                </Link>
                <div className="space-y-1">
                  <div className="px-4 py-2 text-base font-medium text-gray-700">Computers</div>
                  <Link
                    to="/products/pc"
                    className="block px-6 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    Gaming PC
                  </Link>
                  <Link
                    to="/products/laptop"
                    className="block px-6 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    Laptop
                  </Link>
                </div>
                <div className="space-y-1">
                  <div className="px-4 py-2 text-base font-medium text-gray-700">Components</div>
                  <Link
                    to="/products/cpu"
                    className="block px-6 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    CPU
                  </Link>
                  <Link
                    to="/products/gpu"
                    className="block px-6 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    Graphics Card
                  </Link>
                  <Link
                    to="/products/memory"
                    className="block px-6 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    Memory
                  </Link>
                  <Link
                    to="/products/storage"
                    className="block px-6 py-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    Storage
                  </Link>
                </div>
                <Link
                  to="/products/deals"
                  className="block px-4 py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                >
                  Deals
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