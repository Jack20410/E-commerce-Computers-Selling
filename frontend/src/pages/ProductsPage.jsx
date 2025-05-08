import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import productService from '../services/productService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, perPage: 10 });

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
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (queryParam) {
          // Search API with pagination
          const response = await productService.searchProducts(queryParam, page, pagination.perPage);
          setProducts(response.products || []);
          setPagination(response.pagination || { current: 1, pages: 1, total: 0, perPage: 10 });
        } else {
          const params = {
            sort: sort || undefined,
            brand: selectedBrand || undefined,
            page,
            limit: pagination.perPage
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
  }, [category, sort, selectedBrand, queryParam, page]);

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {queryParam
              ? `Search Results for "${queryParam}"`
              : category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
              : 'All Products'}
          </h1>
          {!queryParam && (
            <div className="flex gap-4">
              {/* Brand Dropdown */}
              {brands.length > 0 && (
                <select
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
              {/* Sort Dropdown */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Sort by</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="brand">Brand: A-Z</option>
                <option value="-brand">Brand: Z-A</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex justify-center mt-8">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(pagination.pages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePageChange(idx + 1)}
                className={`px-4 py-2 mx-1 rounded ${pagination.current === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;