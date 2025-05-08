import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/currencyFormatter';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems = [], getCartTotal, getCartItemsCount, removeFromCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartPreviewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery !== "") {
      navigate(`/products?query=${encodeURIComponent(trimmedQuery)}`); // <-- change here
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside cart preview
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartPreviewRef.current && !cartPreviewRef.current.contains(event.target)) {
        setIsCartPreviewOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Cart preview component
  const CartPreview = () => {
    if (!isCartPreviewOpen || !Array.isArray(cartItems) || cartItems.length === 0) return null;

    return (
      <div
        ref={cartPreviewRef}
        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-4 z-50"
      >
        <div className="px-4 py-2 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Shopping Cart</h3>
          <p className="text-sm text-gray-500">{getCartItemsCount()} items</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {cartItems.map((item) => {
            if (!item || !item.id) return null;
            return (
              <div key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center space-x-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                        e.target.onerror = null;
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800">{item.name || 'Unnamed Product'}</h4>
                    <p className="text-sm text-gray-500">
                      {item.quantity || 0} × {formatVND(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">Total:</span>
            <span className="text-lg font-semibold text-gray-800">{formatVND(getCartTotal())}</span>
          </div>
          <Link
            to="/cart"
            className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300"
            onClick={() => setIsCartPreviewOpen(false)}
          >
            View Cart
          </Link>
        </div>
      </div>
    );
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
                  <a href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Home</a>
                  <div className="relative group">
                    <button className="text-gray-700 group-hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-200 inline-flex items-center group-hover:scale-105">
                      Computers
                      <svg className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                      <div className="py-2 px-1">
                        <Link to="/products/category/pc" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Gaming PC</Link>
                        <Link to="/products/category/laptop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Laptop</Link>
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
                        <Link to="/products/category/cpu" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">CPUs</Link>
                        <Link to="/products/category/motherboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Motherboards</Link>
                        <Link to="/products/category/graphicsCard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Graphics Cards</Link>
                        <Link to="/products/category/storage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Storage</Link>
                        <Link to="/products/category/memory" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Memory</Link>
                        <Link to="/products/category/gears" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Gears</Link>
                        <Link to="/products/category/monitor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150">Monitors</Link>
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
              {/* Search bar */}
      <div className="relative group">
        {/* Search icon */}
        <div
          className="absolute left-3 top-2.5 cursor-pointer"
          onClick={handleSearch}
        >
          <svg
            className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search products..."
          className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 group-hover:bg-white transition-all duration-200"
        />
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
              <div className="relative">
                <button
                  onMouseEnter={() => setIsCartPreviewOpen(true)}
                  onClick={() => navigate('/cart')}
                  className="relative text-gray-700 hover:text-blue-600 transition-all duration-200 hover:scale-105"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform transition-transform duration-200 hover:scale-110">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>
                <CartPreview />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none transition-all duration-200 p-2 rounded-lg hover:bg-blue-50"
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
        <div className={`md:hidden fixed inset-0 z-40 transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Overlay */}
          <div 
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative w-[85%] max-w-sm h-full bg-white shadow-xl overflow-y-auto">
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <div className="absolute left-3 top-3.5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="py-2">
                  <div className="text-base font-medium text-gray-900 mb-4">
                    Hi, {user.fullName}
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Account</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-3 text-gray-700 hover:text-blue-600 font-medium rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-200 hover:bg-blue-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 font-medium rounded-xl transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Mobile Menu Items */}
              <div className="space-y-6">
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </Link>

                {/* Computers Section */}
                <div className="space-y-2">
                  <div className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Computers</div>
                  <Link
                    to="/products/category/pc"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Gaming PC</span>
                  </Link>
                  <Link
                    to="/products/category/laptop"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Laptop</span>
                  </Link>
                </div>

                {/* Components Section */}
                <div className="space-y-2">
                  <div className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Components</div>
                  <Link
                    to="/products/category/cpu"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span>CPU</span>
                  </Link>
                  <Link
                    to="/products/category/graphicsCard"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Graphics Card</span>
                  </Link>
                  <Link
                    to="/products/category/motherboard"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Motherboard</span>
                  </Link>
                  <Link
                    to="/products/category/monitor"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Monitor</span>
                  </Link>
                  <Link
                    to="/products/category/gears"
                    className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Gears</span>
                  </Link>
                </div>

                {/* Deals */}
                <Link
                  to="/products/deals"
                  className="flex items-center space-x-2 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors duration-150"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span>Deals</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;