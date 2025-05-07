import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import productService from '../services/productService';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { category } = useParams(); // Lấy category từ URL nếu có
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchProducts = async () => {
      try {
        let res;
        if (category) {
          console.log('Fetching products for category:', category);
          // Gọi API trực tiếp để test
          const response = await fetch(`http://localhost:3001/products/api/category/${category}`);
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message || 'Failed to fetch category products');
          }
          res = { data: data.data, pagination: data.pagination };
        } else {
          res = await productService.getProducts();
        }
        setProducts(res.data);
      } catch (err) {
        console.error('Error details:', err);
        setError(`Failed to load products: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);

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
        <h1 className="text-3xl font-bold mb-8">
          {category ? `Tất cả sản phẩm ${category}` : 'All Products'}
        </h1>

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