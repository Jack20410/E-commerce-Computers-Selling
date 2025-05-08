import { Helmet } from 'react-helmet-async';
import Banner from '../components/ui/Banner';
import FeaturedProducts from '../components/product/FeaturedProducts';
import Categories from '../components/ui/Categories';
import LaptopCategories from '../components/product/LaptopCategories';
import ProcessorCategories from '../components/product/ProcessorCategories';
import GraphicsCategories from '../components/product/GraphicsCategories';
import MonitorCategories from '../components/product/MonitorCategories';
import { useEffect, useState } from 'react';
import reviewService from '../services/reviewService';

const HomePage = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Lấy 6 review mới nhất toàn hệ thống
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/reviews/all?limit=6');
        const data = await res.json();
        setTestimonials(data.data || []);
      } catch (err) {
        setTestimonials([]);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <>
      <Helmet>
        <title>Home | Computer Store</title>
        <meta name="description" content="Find the best computers and accessories for your needs" />
      </Helmet>
      <div className="overflow-x-hidden w-full">
        <Banner />
        
        {/* Featured products section */}
        <FeaturedProducts />
        
        {/* Product category sections */}
        <LaptopCategories />
        <ProcessorCategories />
        <GraphicsCategories />
        <MonitorCategories />
        
        {/* Categories section */}
        <Categories />
        
        {/* Special offers banner */}
        <div className="bg-blue-600 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Special Summer Sale
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Get up to 30% off on selected gaming PCs and laptops.
            </p>
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                View Deals
              </a>
            </div>
          </div>
        </div>
        
        {/* Testimonials section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                What Our Customers Say
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Trusted by gamers, professionals, and tech enthusiasts
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.length > 0 ? testimonials.map((review, idx) => (
                <div key={review._id || idx} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={review.userAvatar || 'https://www.gravatar.com/avatar/?d=mp'}
                        alt={review.userName}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{review.userName || 'Ẩn danh'}</h3>
                      <div className="flex items-center gap-2">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} className={`h-5 w-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-gray-600">
                    <p>{review.comment}</p>
                  </div>
                  <div className="mt-4 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
              )) : (
                <div className="col-span-3 text-center text-gray-400">No testimonials yet.</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Newsletter subscription */}
        <div className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Stay updated with our newsletter
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Get the latest tech news, product updates, and exclusive offers delivered to your inbox.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs border-gray-300 rounded-md"
                    placeholder="Enter your email"
                  />
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-gray-500">
                  We care about your data. Read our{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;