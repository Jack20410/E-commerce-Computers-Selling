import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import productService from '../services/productService';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

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
        const params = {
          sort: sort || undefined,
          brand: selectedBrand || undefined
        };

        let response;
        if (category) {
          response = await productService.getProductsByCategory(category, params);
          setProducts(response.data);
        } else {
          response = await productService.getProducts(params);
          setProducts(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort, selectedBrand]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <>
      <Helmet>
        <title>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'All Products'} | Computer Store</title>
        <meta name="description" content="Browse our selection of computers and accessories" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'All Products'}
          </h1>
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
              key={product._id} 
              onClick={() => handleProductClick(product._id)}
              className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;