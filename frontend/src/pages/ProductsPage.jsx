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
  const [sort, setSort] = useState(''); // NEW: sort state
  const [brands, setBrands] = useState([]); // NEW: brands state
  const [selectedBrand, setSelectedBrand] = useState(''); // NEW: selected brand

  useEffect(() => {
    // Fetch brands for the current category
    const fetchBrands = async () => {
      if (!category) {
        setBrands([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/products/api/category/${category}/brands`);
        const data = await res.json();
        if (data.success) {
          setBrands(data.data);
        } else {
          setBrands([]);
        }
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, [category]);
  
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        let res;
        let sortQuery = sort ? `&sort=${sort}` : '';
        let brandQuery = selectedBrand ? `&brand=${encodeURIComponent(selectedBrand)}` : '';
        if (category) {
          const response = await fetch(
            `http://localhost:3001/products/api/category/${category}?${sort ? `sort=${sort}` : ''}${brandQuery}`
          );
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message || 'Failed to fetch category products');
          }
          res = { data: data.data, pagination: data.pagination };
        } else {
          res = await productService.getProducts({ sort, brand: selectedBrand });
        }
        setProducts(res.data);
      } catch (err) {
        setError(`Failed to load products: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort, selectedBrand]); // Add selectedBrand as dependency

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
            {category ? `All Products ${category}` : 'All Products'}
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
              className="cursor-pointer"
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