import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import productService from '../services/productService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PRICE_RANGES = [
  { label: '2 triệu - 10 triệu', value: '2-10', min: 2000000, max: 10000000 },
  { label: '11 triệu - 20 triệu', value: '11-20', min: 11000000, max: 20000000 },
  { label: '20 triệu - trở lên', value: '20-100', min: 20000000, max: 100000000 },


];

const ProductsPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const query = useQuery();
  const queryParam = query.get('query') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, perPage: 9 });
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get page from query string
  const page = parseInt(query.get('page')) || 1;

  useEffect(() => {
    // Fetch brands for the current category
    const fetchBrands = async () => {
      if (!category) {
        setBrands([]);
        return;
      }
      try {
        const response = await productService.getBrandsByCategory(category);
        setBrands(response || []);
      } catch (err) {
        console.error('Error fetching brands:', err);
        setBrands([]);
      }
    };
    fetchBrands();
  }, [category]);

  useEffect(() => {
    let minPrice, maxPrice;
    if (selectedPriceRange) {
      const range = PRICE_RANGES.find(r => r.value === selectedPriceRange);
      minPrice = range?.min;
      maxPrice = range?.max;
    } else if (minPriceInput || maxPriceInput) {
      minPrice = minPriceInput ? Number(minPriceInput) : undefined;
      maxPrice = maxPriceInput ? Number(maxPriceInput) : undefined;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (queryParam) {
          const response = await productService.searchProducts(
            queryParam,
            page,
            pagination.perPage,
            minPrice,
            maxPrice
          );
          setProducts(response.products || []);
          setPagination(response.pagination || { current: 1, pages: 1, total: 0, perPage: 10 });
        } else {
          const params = {
            sort: sort || undefined,
            brand: selectedBrand || undefined,
            page,
            limit: pagination.perPage,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          };

          let response;
          if (category) {
            response = await productService.getProductsByCategory(category, params);
            setProducts(response.data);
            setPagination(response.pagination || { current: 1, pages: 1, total: 0, perPage: 10 });
          } else {
            response = await productService.getProducts(params);
            setProducts(response.data);
            setPagination(response.pagination || { current: 1, pages: 1, total: 0, perPage: 10 });
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort, selectedBrand, queryParam, page, selectedPriceRange, minPriceInput, maxPriceInput]);
  
  // Helper to clear slider/min-max when checkbox is selected
  const handleCheckboxChange = (value) => {
    setSelectedPriceRange(selectedPriceRange === value ? '' : value);
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  // Helper to clear checkbox when slider/min-max is used
  const handleMinMaxChange = (min, max) => {
    setSelectedPriceRange('');
    setMinPriceInput(min);
    setMaxPriceInput(max);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handlePageChange = (newPage) => {
    // Update the page in the query string
    query.set('page', newPage);
    navigate({ search: query.toString() });
  };

  return (
    <>
      <Helmet>
        <title>
          {queryParam
            ? `Search Results for "${queryParam}"`
            : category
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
            : 'All Products'} | Computer Store
        </title>
        <meta name="description" content="Browse our selection of computers and accessories" />
      </Helmet>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-10 xl:px-12 py-4 sm:py-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filter - Responsive */}
          <aside className={`w-full lg:w-64 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              {/* Brand Filter */}
              {category && (
                <div className="mb-4 sm:mb-6">
                  <h2 className="font-bold mb-3 text-sm sm:text-lg text-blue-700 tracking-wide">BRAND</h2>
                  <div className="space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map(brand => (
                      <label
                        key={brand}
                        className={`flex items-center px-2 py-2 sm:py-1 rounded-lg transition-colors cursor-pointer hover:bg-blue-50 active:bg-blue-100 ${
                          selectedBrand === brand ? 'bg-blue-100' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrand === brand}
                          onChange={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                          className="mr-3 accent-blue-600 w-4 h-4 sm:w-4 sm:h-4"
                        />
                        <span className="capitalize text-sm sm:text-base text-gray-700 select-none">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {/* Price Range Filter */}
              <div>
                <h2 className="font-bold mb-3 text-sm sm:text-lg text-blue-700 tracking-wide">PRICE RANGE (VNĐ)</h2>
                <div className="space-y-1 sm:space-y-2">
                  {PRICE_RANGES.map(range => (
                    <label
                      key={range.value}
                      className={`flex items-center px-2 py-2 sm:py-1 rounded-lg transition-colors cursor-pointer hover:bg-blue-50 active:bg-blue-100 ${
                        selectedPriceRange === range.value ? 'bg-blue-100' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceRange === range.value}
                        onChange={() => handleCheckboxChange(range.value)}
                        className="mr-3 accent-blue-600 w-4 h-4"
                      />
                      <span className="text-sm sm:text-base text-gray-700 select-none">{range.label}</span>
                    </label>
                  ))}
                </div>
                {/* Price Range Slider and Min-Max Input */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={e => handleMinMaxChange(e.target.value, maxPriceInput)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                    <span className="text-gray-400 px-1">-</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={e => handleMinMaxChange(minPriceInput, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Min Price: {(minPriceInput || 0).toLocaleString('vi-VN')}₫</label>
                      <input
                        type="range"
                        min={0}
                        max={50000000}
                        step={1000000}
                        value={minPriceInput || 0}
                        onChange={e => handleMinMaxChange(e.target.value, maxPriceInput)}
                        className="w-full accent-blue-600 h-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Max Price: {(maxPriceInput || 0).toLocaleString('vi-VN')}₫</label>
                      <input
                        type="range"
                        min={0}
                        max={150000000}
                        step={1000000}
                        value={maxPriceInput || 0}
                        onChange={e => handleMinMaxChange(minPriceInput, e.target.value)}
                        className="w-full accent-blue-600 h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  {queryParam
                    ? `Search Results for "${queryParam}"`
                    : category
                    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
                    : 'All Products'}
                </h1>
                {!queryParam && (
                  <div className="flex gap-2">
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option value="">Sort by</option>
                      <option value="price">Price: Low to High</option>
                      <option value="-price">Price: High to Low</option>
                      <option value="name">Name: A-Z</option>
                      <option value="-brand">Name: Z-A</option>
                    </select>
                  </div>
                )}
              </div>
              
              {/* Results Count */}
              {!loading && !error && (
                <p className="text-sm text-gray-600">
                  {products.length > 0 
                    ? `Showing ${products.length} of ${pagination.total} products`
                    : 'No products found'
                  }
                </p>
              )}
            </div>

            {loading && (
              <p className="text-center text-gray-500">Loading products...</p>
            )}

            {error && (
              <p className="text-center text-red-500">{error}</p>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="text-center text-gray-500">No products found.</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {products.map(product => (
                <div 
                  key={product.id || product._id} 
                  onClick={() => handleProductClick(product.id || product._id)}
                  className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8">
                {/* Mobile: Show current page info */}
                <div className="sm:hidden text-sm text-gray-600">
                  Page {pagination.current} of {pagination.pages}
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 sm:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm sm:text-base hover:bg-gray-300 transition-colors"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">‹</span>
                  </button>
                  
                  {/* Desktop: Show all pages, Mobile: Show only current and nearby pages */}
                  <div className="flex gap-1">
                    {/* Show first page if not nearby current */}
                    {pagination.current > 3 && pagination.pages > 5 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base bg-gray-200 hover:bg-gray-300"
                        >
                          1
                        </button>
                        {pagination.current > 4 && <span className="px-2 py-2 text-gray-400">...</span>}
                      </>
                    )}
                    
                    {/* Show current page and nearby pages */}
                    {[...Array(pagination.pages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      const showPage = pagination.pages <= 5 || 
                        (pageNum >= pagination.current - 1 && pageNum <= pagination.current + 1) ||
                        pageNum === 1 || pageNum === pagination.pages;
                      
                      if (!showPage && !(pageNum >= pagination.current - 1 && pageNum <= pagination.current + 1)) {
                        return null;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base transition-colors ${
                            pagination.current === pageNum 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {/* Show last page if not nearby current */}
                    {pagination.current < pagination.pages - 2 && pagination.pages > 5 && (
                      <>
                        {pagination.current < pagination.pages - 3 && <span className="px-2 py-2 text-gray-400">...</span>}
                        <button
                          onClick={() => handlePageChange(pagination.pages)}
                          className="px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base bg-gray-200 hover:bg-gray-300"
                        >
                          {pagination.pages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="px-3 sm:px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-sm sm:text-base hover:bg-gray-300 transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;