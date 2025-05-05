import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">TechStation</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-6">
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">Home</a>
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center group-hover:text-blue-600">
                    Computers
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Pre-built PCs</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Laptops</a>
                  </div>
                </div>
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center group-hover:text-blue-600">
                    Components
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">CPUs</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Motherboards</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Graphics Cards</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Storage</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Memory</a>
                  </div>
                </div>
                <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">Deals</a>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-gray-50 text-gray-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 border border-gray-200"
              />
              <div className="absolute left-3 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </a>
          </div>
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Home</a>
          <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">
            Computers
          </button>
          <div className="pl-4">
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Pre-built PCs</a>
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Laptops</a>
          </div>
          <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">
            Components
          </button>
          <div className="pl-4">
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">CPUs</a>
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Motherboards</a>
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Graphics Cards</a>
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Storage</a>
            <a href="#" className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Memory</a>
          </div>
          <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200">Deals</a>
          <div className="relative mt-3 mx-3">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-50 text-gray-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
            />
            <div className="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 