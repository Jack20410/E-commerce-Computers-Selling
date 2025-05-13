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
  { label: '8 triệu - 11 triệu', value: '8-11', min: 8000000, max: 11000000 },
  { label: '11 triệu - 15 triệu', value: '11-15', min: 11000000, max: 15000000 },
  { label: '15 triệu - 20 triệu', value: '15-20', min: 15000000, max: 20000000 },
  { label: '20 triệu - 25 triệu', value: '20-25', min: 20000000, max: 25000000 },
  { label: '25 triệu - 30 triệu', value: '25-30', min: 25000000, max: 30000000 },
  { label: '30 triệu - 50 triệu', value: '30-50', min: 30000000, max: 50000000 },
  { label: '50 triệu - 70 triệu', value: '50-70', min: 50000000, max: 70000000 },
  { label: '70 triệu - trở lên', value: '50-300', min: 70000000, max: 300000000 },

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
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-10 xl:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter - Responsive */}
          <aside className="w-full lg:w-64">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-8">
              {/* Brand Filter */}
              {category && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-bold mb-3 text-base sm:text-lg text-blue-700 tracking-wide">BRAND</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map(brand => (
                      <label
                        key={brand}
                        className={`flex items-center px-2 py-1 rounded-lg transition-colors cursor-pointer hover:bg-blue-50 ${
                          selectedBrand === brand ? 'bg-blue-100' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrand === brand}
                          onChange={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                          className="mr-2 accent-blue-600 w-4 h-4"
                        />
                        <span className="capitalize text-sm sm:text-base text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {/* Price Range Filter */}
              <div>
                <h2 className="font-bold mb-3 text-base sm:text-lg text-blue-700 tracking-wide">PRICE RANGE (VNĐ)</h2>
                <div className="space-y-2">
                  {PRICE_RANGES.map(range => (
                    <label
                      key={range.value}
                      className={`flex items-center px-2 py-1 rounded-lg transition-colors cursor-pointer hover:bg-blue-50 ${
                        selectedPriceRange === range.value ? 'bg-blue-100' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceRange === range.value}
                        onChange={() => handleCheckboxChange(range.value)}
                        className="mr-2 accent-blue-600 w-4 h-4"
                      />
                      <span className="text-sm sm:text-base text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
                {/* Price Range Slider and Min-Max Input */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={e => handleMinMaxChange(e.target.value, maxPriceInput)}
                      className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={e => handleMinMaxChange(minPriceInput, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="range"
                      min={0}
                      max={50000000}
                      step={1000000}
                      value={minPriceInput || 0}
                      onChange={e => handleMinMaxChange(e.target.value, maxPriceInput)}
                      className="w-full accent-blue-600"
                    />
                    <input
                      type="range"
                      min={0}
                      max={150000000}
                      step={1000000}
                      value={maxPriceInput || 0}
                      onChange={e => handleMinMaxChange(minPriceInput, e.target.value)}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {queryParam
                  ? `Search Results for "${queryParam}"`
                  : category
                  ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
                  : 'All Products'}
              </h1>
              {!queryParam && (
                <div className="flex flex-wrap gap-4">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-auto"
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

            {loading && (
              <p className="text-center text-gray-500">Loading products...</p>
            )}

            {error && (
              <p className="text-center text-red-500">{error}</p>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="text-center text-gray-500">No products found.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map(product => (
                <div 
                  key={product.id || product._id} 
                  onClick={() => handleProductClick(product.id || product._id)}
                  className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-3 sm:px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm sm:text-base"
                >
                  Prev
                </button>
                {[...Array(pagination.pages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-3 sm:px-4 py-2 rounded text-sm sm:text-base ${
                      pagination.current === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="px-3 sm:px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm sm:text-base"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;