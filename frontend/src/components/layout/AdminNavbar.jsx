import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaBoxOpen, FaClipboardList, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="mr-2" /> },
  { to: '/admin/products', label: 'Products', icon: <FaBoxOpen className="mr-2" /> },
  { to: '/admin/orders', label: 'Orders', icon: <FaClipboardList className="mr-2" /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers className="mr-2" /> },
];

const AdminNavbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg fixed w-full z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center text-white font-extrabold text-2xl tracking-tight">
              <span className="mr-2">
                <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#2563eb"/><path d="M10 22l6-12 6 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              TechStation <span className="text-blue-200 ml-1">Admin</span>
            </Link>
            {/* Desktop menu */}
            <div className="hidden md:flex ml-10 space-x-2">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive(item.to)
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden">
                <FaUserCircle className="text-blue-700 text-2xl" />
              </div>
              <span className="text-white font-medium">{user?.fullName || 'Admin'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-150"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-gradient-to-b from-blue-800 to-blue-600 shadow-lg`}> 
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-semibold transition-all duration-150 ${
                isActive(item.to)
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
        {/* Mobile user options */}
        <div className="pt-4 pb-3 border-t border-blue-700">
          <div className="flex items-center px-5">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden mr-3">
              <FaUserCircle className="text-blue-700 text-2xl" />
            </div>
            <div>
              <div className="text-base font-medium leading-none text-white">
                {user?.fullName || 'Admin'}
              </div>
              <div className="text-sm font-medium leading-none text-blue-200">
                {user?.email || 'admin@example.com'}
              </div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-150"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;