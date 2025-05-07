import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { formatVND } from '../../utils/currencyFormatter';
import './CategorySlider.css';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3001/products?limit=8&sort=-createdAt`);
        const data = await response.json();
        console.log('Dữ liệu trả về từ API:', data);

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || 'Không thể tải dữ liệu sản phẩm');
          setProducts([]);
        }
      } catch (errDirect) {
        console.error('Lỗi API trực tiếp:', errDirect);
        try {
          const serviceResponse = await productService.getAllProducts({
            limit: 8,
            sort: '-createdAt'
          });

          if (Array.isArray(serviceResponse.data)) {
            setProducts(serviceResponse.data);
          } else {
            setError('Dữ liệu không đúng định dạng');
            setProducts([]);
          }
        } catch (errService) {
          console.error('Lỗi khi dùng productService:', errService);
          setError('Không thể kết nối đến máy chủ');
          setProducts([]);
        }
      }
    } catch (err) {
      console.error('Lỗi tổng quát:', err);
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    const container = sliderRef.current;
    const scrollAmount = 300;
    const maxScroll = container.scrollWidth - container.clientWidth;
    let newPosition;

    if (direction === 'next') {
      newPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
    } else {
      newPosition = Math.max(scrollPosition - scrollAmount, 0);
    }

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Khám phá các sản phẩm công nghệ hàng đầu của chúng tôi
          </p>
        </div>

        <div className="mt-10 slider-container">
          <button
            className="slider-button prev"
            onClick={() => scroll('prev')}
            disabled={scrollPosition === 0}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div ref={sliderRef} className="slider-wrapper">
            {loading ? (
              <div className="flex justify-center items-center w-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3">Đang tải dữ liệu...</span>
              </div>
            ) : error ? (
              <div className="text-center w-full py-10 text-red-500">
                <p>{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Thử lại
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center w-full py-10">Không có sản phẩm nào.</div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="slider-card">
                  <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[450px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></div>

                    <div className="relative h-[250px]">
                      <div className="absolute inset-0">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/300'}
                          alt={product.name}
                          className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-sm font-medium text-white shadow-lg">
                          {product.category?.name || 'Sản phẩm'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col p-6">
                      <h3 className="text-base text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-auto space-y-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg text-gray-900">
                            {formatVND(product.price)}
                          </span>
                        </div>
                        <Link
                          to={`/products/${product._id}`}
                          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 text-center"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={!products.length || scrollPosition >= (products.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
