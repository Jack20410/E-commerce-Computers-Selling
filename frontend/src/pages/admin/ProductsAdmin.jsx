import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';

const ProductsAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: '-createdAt' // Sort by createdAt in descending order (newest first)
        });
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleDeleteClick = (productId) => {
    setDeleteConfirm(productId);
  };

  const confirmDelete = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts(products.filter(product => product._id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Filter products by category (if needed)
  const displayProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mb-100px">


      {/* Category Filter */}
      <div className="mt-12 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {displayProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <>
          {/* Total Products Count */}
          <div className="text-center mt-4 text-sm text-gray-600 mb-10">
            Total Products: {displayProducts.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
            {displayProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-[200px] w-full ">
                  <img 
                    className="absolute  w-full h-full object-contain"
                    src={product.images && product.images.length > 0 
                      ? `http://localhost:3001${product.images[0].url}` 
                      : '/images/placeholder.jpg'} 
                    alt={product.model}
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {product.brand} {product.model}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {formatDate(product.createdAt)}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-lg font-bold text-blue-600">{formatVND(product.price)}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    {deleteConfirm === product._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmDelete(product._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Products Count */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Total Products: {displayProducts.length}
          </div>
        </>
      )}

      {/* Floating Action Button for Add Product */}
      <Link
        to="/admin/products/add"
        className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
        title="Add New Product"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

export default ProductsAdmin; 