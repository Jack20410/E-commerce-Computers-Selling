import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useWebSocket } from '../context/WebSocketContext';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { formatVND } from '../utils/currencyFormatter';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import WebSocketService from '../services/websocket.service';
import ProductCard from '../components/product/ProductCard';
import ProductVariants from '../components/product/ProductVariants';

// Rating Stars Component
const RatingStars = ({ rating = 0, totalRatings }) => (
  <div className="flex items-center">
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    {typeof totalRatings === 'number' && totalRatings > 0 && (
      <span className="ml-2 text-gray-600">({totalRatings} reviews)</span>
    )}
  </div>
);

const SpecificationRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-2 border-b">
    <div className="font-medium text-gray-600">{label}</div>
    <div className="col-span-2">{value}</div>
  </div>
);

const ProductSpecifications = ({ category, specs }) => {
  if (!specs) return null;

  const renderSpecs = () => {
    switch (category) {
      case 'pc':
        return (
          <>
            <SpecificationRow label="Processor" value={specs.processor} />
            <SpecificationRow label="RAM" value={specs.ram} />
            <SpecificationRow label="Storage" value={specs.storage} />
            <SpecificationRow label="Graphics Card" value={specs.graphicsCard} />
            <SpecificationRow label="Motherboard" value={specs.motherboard} />
            <SpecificationRow label="Power Supply" value={specs.powerSupply} />
            <SpecificationRow label="Case" value={specs.case} />
            {specs.operatingSystem && (
              <SpecificationRow label="Operating System" value={specs.operatingSystem} />
            )}
          </>
        );
      
      case 'laptop':
        return (
          <>
            <SpecificationRow label="Processor" value={specs.processor} />
            <SpecificationRow label="RAM" value={specs.ram} />
            <SpecificationRow label="Storage" value={specs.storage} />
            <SpecificationRow label="Display Size" value={specs.displaySize} />
            <SpecificationRow label="Graphics Card" value={specs.graphicsCard} />
            <SpecificationRow label="Battery Life" value={specs.batteryLife} />
            <SpecificationRow label="Weight" value={specs.weight} />
            {specs.operatingSystem && (
              <SpecificationRow label="Operating System" value={specs.operatingSystem} />
            )}
          </>
        );

      case 'cpu':
        return (
          <>
            <SpecificationRow label="Socket" value={specs.socket} />
            <SpecificationRow label="Cores" value={specs.cores} />
            <SpecificationRow label="Threads" value={specs.threads} />
            <SpecificationRow label="Base Speed" value={specs.baseSpeed} />
            <SpecificationRow label="Boost Speed" value={specs.boostSpeed} />
            <SpecificationRow label="Integrated Graphics" value={specs.graphic} />
            <SpecificationRow label="TDP" value={specs.tdp} />
          </>
        );

      case 'graphicsCard':
        return (
          <>
            <SpecificationRow label="Chipset" value={specs.chipset} />
            <SpecificationRow label="Memory" value={specs.memory} />
            <SpecificationRow label="Memory Type" value={specs.memoryType} />
            <SpecificationRow label="Core Clock" value={specs.coreClock} />
            <SpecificationRow label="Boost Clock" value={specs.boostClock} />
            <SpecificationRow label="Power Consumption" value={specs.powerConsumption} />
            {specs.ports && Array.isArray(specs.ports) && specs.ports.length > 0 && (
              <SpecificationRow label="Ports" value={specs.ports.join(', ')} />
            )}
          </>
        );

      case 'motherboard':
        return (
          <>
            <SpecificationRow label="Socket" value={specs.socket} />
            <SpecificationRow label="Chipset" value={specs.chipset} />
            <SpecificationRow label="Form Factor" value={specs.formFactor} />
            <SpecificationRow label="Memory Slots" value={specs.memorySlots} />
            <SpecificationRow label="Max Memory" value={specs.maxMemory} />
            <SpecificationRow label="Memory Type" value={specs.supportedMemoryType} />
            {specs.pcieSlots && Array.isArray(specs.pcieSlots) && specs.pcieSlots.length > 0 && (
              <SpecificationRow label="PCIe Slots" value={specs.pcieSlots.join(', ')} />
            )}
            <SpecificationRow label="SATA Connectors" value={specs.sataConnectors} />
          </>
        );

      case 'memory':
        return (
          <>
            <SpecificationRow label="Type" value={specs.type} />
            <SpecificationRow label="Capacity" value={specs.capacity} />
            <SpecificationRow label="Speed" value={specs.speed} />
            <SpecificationRow label="Latency" value={specs.latency} />
            <SpecificationRow label="Voltage" value={specs.voltage} />
          </>
        );

      case 'storage':
        return (
          <>
            <SpecificationRow label="Type" value={specs.type} />
            <SpecificationRow label="Capacity" value={specs.capacity} />
            <SpecificationRow label="Form Factor" value={specs.formFactor} />
            <SpecificationRow label="Interface" value={specs.interface} />
            <SpecificationRow label="Read Speed" value={specs.readSpeed} />
            <SpecificationRow label="Write Speed" value={specs.writeSpeed} />
          </>
        );

      case 'monitor':
        return (
          <>
            <SpecificationRow label="Display Size" value={specs.displaySize} />
            <SpecificationRow label="Resolution" value={specs.resolution} />
            <SpecificationRow label="Panel Type" value={specs.panelType} />
            <SpecificationRow label="Refresh Rate" value={specs.refreshRate} />
            <SpecificationRow label="Response Time" value={specs.responseTime} />
            {specs.ports && Array.isArray(specs.ports) && specs.ports.length > 0 && (
              <SpecificationRow label="Ports" value={specs.ports.join(', ')} />
            )}
            <SpecificationRow label="HDR Support" value={specs.hdrSupport ? 'Yes' : 'No'} />
          </>
        );

      case 'gears':
        return (
          <>
            <SpecificationRow label="Type" value={specs.type} />
            <SpecificationRow label="Connectivity" value={specs.connectivity} />
            {specs.features && Array.isArray(specs.features) && specs.features.length > 0 && (
              <SpecificationRow label="Features" value={specs.features.join(', ')} />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <SpecificationRow label="Brand" value={specs.brand} />
        <SpecificationRow label="Model" value={specs.model} />
        {renderSpecs()}
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => (
  <div className="border-b border-gray-200 py-6 last:border-b-0">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <img
          className="h-10 w-10 rounded-full"
          src={review.userAvatar || 'https://www.gravatar.com/avatar/?d=mp'}
          alt={review.userName}
        />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{review.userName}</h3>
          <p className="text-sm text-gray-500">{review.date}</p>
        </div>
        <div className="mt-1">
          <RatingStars rating={review.rating} />
        </div>
        {review.purchaseVerified && (
          <p className="mt-1 text-sm text-green-600">Verified Purchase</p>
        )}
        <p className="mt-2 text-gray-600 whitespace-pre-line">{review.comment}</p>
        {review.images && review.images.length > 0 && (
          <div className="mt-4 flex gap-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center space-x-4">
          <button className="flex items-center text-sm text-gray-500 hover:text-blue-600">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Helpful ({review.helpfulCount})
          </button>
          <button className="text-sm text-gray-500 hover:text-blue-600">Reply</button>
        </div>
      </div>
    </div>
  </div>
);

// Rating Distribution Component
const RatingDistribution = ({ ratings }) => (
  <div className="space-y-2">
    {[5, 4, 3, 2, 1].map((star) => (
      <div key={star} className="flex items-center">
        <div className="w-12 text-sm text-gray-600">{star} Star</div>
        <div className="flex-1 mx-4 h-4 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-yellow-400"
            style={{ width: ratings[star] > 0 ? `${(ratings[star] / Math.max(1, Object.values(ratings).reduce((a, b) => a + b, 0))) * 100}%` : '0%' }}
          />
        </div>
        <div className="w-12 text-sm text-gray-600 text-right">{ratings[star] || 0}</div>
      </div>
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ total: 0, average: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ userName: '', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [variants, setVariants] = useState([]);
  const REVIEWS_PER_PAGE = 5;
  const { joinProductRoom, leaveProductRoom } = useWebSocket();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching product with ID:', id);
        
        const data = await productService.getProductById(id);
        console.log('Received product data:', data);
        
        if (!data) {
          throw new Error('No product data received');
        }

        setProduct(data);
        
        // Handle image URLs
        const mainImage = data.images?.find(img => img.isMain);
        const firstImage = data.images?.[0];
        const imageUrl = mainImage?.url || firstImage?.url;
        setSelectedImage(imageUrl ? getImageUrl(imageUrl) : getPlaceholderImage(data.category));

        // Fetch variants
        const variantsData = await productService.getProductVariants(id);
        setVariants(variantsData);

        // Update recently viewed products
        const recentlyViewedProducts = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        // Remove the current product if it exists in the list
        const filteredProducts = recentlyViewedProducts.filter(p => p._id !== data._id);
        
        // Add the current product to the beginning
        const updatedProducts = [data, ...filteredProducts].slice(0, 5);
        
        // Update localStorage and state
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedProducts));
        setRecentlyViewed(updatedProducts);
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product details. Please try again.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    // Fetch similar products when product data is available
    const fetchSimilarProducts = async () => {
      if (product && product.category && product._id) {
        try {
          console.log('Fetching similar products for category:', product.category);
          
          // Use the dedicated endpoint for similar products
          const similarProductsData = await productService.getSimilarProducts(
            product.category, 
            product._id
          );
          
          console.log('Fetched similar products:', similarProductsData.length);
          setSimilarProducts(similarProductsData);
        } catch (err) {
          console.error('Error fetching similar products:', err);
          setSimilarProducts([]);
        }
      }
    };

    fetchSimilarProducts();
  }, [product]);

  useEffect(() => {
    if (product && product._id) {
      // Join the product room for real-time updates
      try {
        joinProductRoom(product._id);
      } catch (err) {
        console.error('Error joining product room:', err);
      }
      
      // Clean up when component unmounts
      return () => {
        try {
          leaveProductRoom(product._id);
        } catch (err) {
          console.error('Error leaving product room:', err);
        }
      };
    }
  }, [product, joinProductRoom, leaveProductRoom]);

  // Modified function to subscribe directly to review updates
  useEffect(() => {
    if (!product || !product._id) return;
    
    // Setup WebSocket listener for review updates
    const handleReviewUpdate = (data) => {
      console.log("Received review update in ProductDetailPage:", data);
      
      if (data.productId === product._id) {
        if (data.review) {
          // Add the new review to the existing reviews
          setReviews(prevReviews => {
            // Check if review already exists by ID to avoid duplicates
            const exists = prevReviews.some(r => r._id === data.review._id);
            if (exists) {
              return prevReviews.map(r => 
                r._id === data.review._id ? data.review : r
              );
            }
            // If it's a new review, add it to the beginning
            return [data.review, ...prevReviews];
          });
          
          // Update rating summary
          if (data.review.rating) {
            setRatingSummary(prev => {
              const newTotal = (prev.total || 0) + 1;
              const newSum = (prev.average * (prev.total || 0)) + data.review.rating;
              const newAverage = newSum / newTotal;
              
              return {
                total: newTotal,
                average: newAverage
              };
            });
          }
        } else {
          // If the data doesn't include review (like when multiple reviews are added),
          // then fetch all reviews
          fetchReviews();
        }
      }
    };
    
    // Subscribe to review updates
    WebSocketService.subscribeToReviewUpdates(handleReviewUpdate);
    
    // Cleanup
    return () => {
      WebSocketService.unsubscribeFromReviewUpdates();
    };
  }, [product]);

  // Đưa fetchReviews ra ngoài để có thể gọi lại khi có review realtime
  const fetchReviews = async () => {
    if (product && product._id) {
      try {
        const [reviewsData, summaryData] = await Promise.all([
          reviewService.getReviewsByProduct(product._id),
          reviewService.getRatingSummary(product._id)
        ]);
        setReviews(reviewsData);
        setRatingSummary(summaryData);
      } catch (err) {
        setReviews([]);
        setRatingSummary({ total: 0, average: 0 });
      }
    }
  };

  // Thay thế useEffect fetchReviews cũ bằng fetchReviews mới
  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartProduct = {
      id: product._id,
      name: `${product.brand} ${product.model}`,
      price: Number(product.price),
      image: product.images?.[0]?.url ? getImageUrl(product.images[0].url) : getPlaceholderImage(product.category),
      brand: product.brand,
      model: product.model,
      category: product.category,
      stock: product.stock,
      quantity: quantity
    };

    let success = true;
    for (let i = 0; i < quantity; i++) {
      const result = addToCart(cartProduct);
      if (!result) {
        success = false;
        break;
      }
    }

    if (!success) {
      setError(`Sorry, only ${product.stock} items available in stock.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Product not found.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Tính lại rating summary chỉ dựa trên review có rating
  const ratingReviews = reviews.filter(r => r.rating >= 1 && r.rating <= 5);
  const ratingCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingReviews.forEach(r => {
    ratingCount[r.rating]++;
  });
  const totalRatings = ratingReviews.length;
  const averageRating = totalRatings > 0 ? (ratingReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;

  return (
    <>
      <Helmet>
        <title>{`${product.brand} ${product.model} | Computer Store`}</title>
        <meta name="description" content={product.description} />
      </Helmet>
      
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-4">
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
          </div>
        )}
        
        <div className="container mx-auto px-3 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-xs">
              <li><Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link to={`/products/category/${product.category}`} className="text-gray-500 hover:text-blue-600 transition-colors capitalize">{product.category}</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-gray-900 font-medium truncate">{product.model}</li>
            </ol>
          </nav>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-lg shadow-lg p-4 mb-6">
            {/* Product Images */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 min-h-[550px] w-full max-w-[550px] mx-auto aspect-square flex items-center justify-center relative group overflow-hidden">
                {selectedImage ? (
                  <div className="relative w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-105">
                    <img 
                      src={selectedImage}
                      alt={`${product.brand} ${product.model}`}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={getPlaceholderImage(product.category)}
                      alt="No image available"
                      className="absolute inset-0 w-full h-full object-contain opacity-50"
                    />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-hide justify-center">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(getImageUrl(image.url))}
                      className={`bg-white flex items-center justify-center
                        ${selectedImage === getImageUrl(image.url) 
                          ? 'outline outline-2 outline-blue-500' 
                          : 'hover:outline hover:outline-1 hover:outline-gray-300'}
                      `}
                    >
                      <img
                        src={getImageUrl(image.url)}
                        alt={`${product.brand} ${product.model} - View ${index + 1}`}
                        className="max-w-full max-h-full w-auto h-auto object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {product.brand} {product.model}
                </h1>
                <div className="flex items-center space-x-4">
                   <RatingStars rating={averageRating} />
                  <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                  {totalRatings} Reviews                  </span>
                </div>
                <div className="mt-3 flex items-baseline space-x-3">
                  <p className="text-3xl text-blue-600 font-bold">
                    {formatVND(product.price)}
                  </p>
                  {product.oldPrice && (
                    <p className="text-lg text-gray-400 line-through">
                      {formatVND(product.oldPrice)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-100 py-3">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              <div className="space-y-4">
                {/* Product Variants Selection */}
                {variants && variants.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Product options</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div
                        className="px-3 py-2 rounded-lg text-sm font-medium border bg-blue-50 border-blue-600 text-blue-700"
                      >
                        {product.specifications?.processor || 
                         product.specifications?.capacity || 
                         product.specifications?.memory ||
                         product.specifications?.displaySize ||
                         'Base model'}
                      </div>
                      {variants.map((variant) => (
                        <Link
                          key={variant._id}
                          to={`/products/${variant._id}`}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <span>
                            {variant.specifications?.processor || 
                             variant.specifications?.capacity || 
                             variant.specifications?.memory ||
                             variant.specifications?.displaySize ||
                             variant.model}
                          </span>
                          {variant.price !== product.price && (
                            <span className={`ml-2 text-xs ${variant.price > product.price ? 'text-red-600' : 'text-green-600'}`}>
                              {variant.price > product.price ? '+' : '-'}
                              {Math.abs(variant.price - product.price).toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label htmlFor="quantity" className="text-sm text-gray-600">Quantity:</label>
                    <div className="relative">
                      <select 
                        id="quantity"
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="appearance-none bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[...Array(Math.min(5, product.stock))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Availability:</span>
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {product.stock > 0 && (
                  <div className="space-y-4">
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg
                        hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md
                        flex items-center justify-center space-x-2 text-sm font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>

                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center space-x-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Fast Delivery</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Secure Payment</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Specifications
            </h2>
            <ProductSpecifications 
              category={product.category} 
              specs={{ ...product, ...product.specifications }} 
            />
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Reviews & Ratings
            </h2>
            {/* Tổng quan rating */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600">{averageRating}</div>
                <div className="flex flex-col">
                  <RatingStars rating={averageRating} />
                  <span className="text-xs text-gray-500 mt-1">{totalRatings} đánh giá</span>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <RatingDistribution ratings={ratingCount} />
              </div>
            </div>
            {/* Form đánh giá */}
            <div className="flex items-start gap-3 mb-8">
              <img
                src="https://www.gravatar.com/avatar/?d=mp"
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <form onSubmit={async (e) => {
                e.preventDefault();
                setReviewLoading(true);
                setReviewError('');
                setReviewSuccess('');
                
                // Save review data for optimistic update
                const reviewData = {
                  productId: product._id,
                  userName: reviewForm.userName,
                  comment: reviewForm.comment,
                  createdAt: new Date().toISOString()
                };
                
                try {
                  // Optimistic update - add the review immediately
                  const optimisticId = 'temp-' + Date.now();
                  const optimisticReview = {
                    _id: optimisticId,
                    ...reviewData,
                    isPending: true
                  };
                  
                  // Add to UI immediately
                  setReviews(prev => [optimisticReview, ...prev]);
                  
                  // Send to the server
                  const response = await reviewService.createReview(reviewData);
                  
                  // WebSocket will handle the real update when the server broadcasts it
                  // but we'll set success message now
                  setReviewSuccess('Cảm ơn bạn đã bình luận!');
                  setReviewForm({ userName: '', comment: '' });
                  setShowReviewForm(false);
                  
                  // If WebSocket fails to update, we can fall back to manual update
                  // by removing the optimistic review after a timeout
                  setTimeout(() => {
                    setReviews(prevReviews => {
                      // If the optimistic review is still there, replace it
                      const stillHasOptimistic = prevReviews.some(r => r._id === optimisticId);
                      if (stillHasOptimistic) {
                        // Remove the temporary review
                        return prevReviews.filter(r => r._id !== optimisticId);
                      }
                      return prevReviews;
                    });
                  }, 5000);
                } catch (err) {
                  // Remove optimistic update in case of error
                  setReviews(prev => prev.filter(r => !r.isPending));
                  setReviewError(err.message || 'Gửi bình luận thất bại');
                } finally {
                  setReviewLoading(false);
                }
              }} className="flex-1">
                <input
                  type="text"
                  className="w-full border-b border-gray-300 focus:border-blue-500 outline-none px-2 py-2 text-sm"
                  placeholder="Write Comment..."
                  value={reviewForm.comment}
                  onFocus={() => setShowReviewForm(true)}
                  onChange={e => {
                    setShowReviewForm(true);
                    setReviewForm(f => ({ ...f, comment: e.target.value }));
                  }}
                  readOnly={showReviewForm ? false : !reviewForm.userName}
                  required
                />
                {showReviewForm && (
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Your Name"
                        value={reviewForm.userName}
                        onChange={e => setReviewForm(f => ({ ...f, userName: e.target.value }))}
                        required
                        style={{ minWidth: 120 }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-60 text-sm"
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? 'Đang gửi...' : 'Send'}
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-300 text-sm"
                        onClick={() => { setShowReviewForm(false); setReviewForm({ ...reviewForm, comment: '' }); }}
                      >
                        Cancel
                      </button>
                    </div>
                    {reviewError && <div className="text-red-500 text-sm mt-1">{reviewError}</div>}
                    {reviewSuccess && <div className="text-green-600 text-sm mt-1">{reviewSuccess}</div>}
                  </div>
                )}
              </form>
            </div>
            {/* Danh sách bình luận */}
            <div className="space-y-6">
              {reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 10-8 0 4 4 0 008 0zm6 8v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a6 6 0 0112 0v2a2 2 0 002 2h2a2 2 0 002-2v-2a6 6 0 00-12 0" /></svg>
                  <span>Chưa có bình luận nào cho sản phẩm này.</span>
                </div>
              )}
              {reviews.length > 0 && (
                <>
                  {reviews.slice((currentReviewPage-1)*REVIEWS_PER_PAGE, currentReviewPage*REVIEWS_PER_PAGE).map((review) => (
                    <div
                      key={review._id}
                      className={`flex items-start gap-3 bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition-shadow ${review.isPending ? 'opacity-70 border-dashed border-blue-300' : ''}`}
                    >
                      <img
                        src={review.userAvatar || 'https://www.gravatar.com/avatar/?d=mp'}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <div>
                            <span className="font-semibold text-gray-900 text-base">{review.userName || 'Ẩn danh'}</span>
                            <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {review.isPending && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Đang gửi...</span>
                          )}
                        </div>
                        {review.purchaseVerified && (
                          <span className="inline-block text-xs text-green-600 bg-green-50 rounded px-2 py-0.5 mb-1 font-medium">Purchased</span>
                        )}
                        {review.rating && (
                          <div className="flex items-center gap-1 mb-1">
                            {[1,2,3,4,5].map(star => (
                              <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                          </div>
                        )}
                        <div className="text-gray-800 text-sm whitespace-pre-line break-words">{review.comment}</div>
                      </div>
                    </div>
                  ))}
                  {/* Pagination */}
                  {reviews.length > REVIEWS_PER_PAGE && (
                    <div className="flex justify-center mt-4 gap-2">
                      <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-blue-100 disabled:opacity-50"
                        onClick={() => setCurrentReviewPage(p => Math.max(1, p-1))}
                        disabled={currentReviewPage === 1}
                      >
                        Trước
                      </button>
                      {Array.from({length: Math.ceil(reviews.length / REVIEWS_PER_PAGE)}, (_, i) => i+1).map(page => (
                        <button
                          key={page}
                          className={`px-3 py-1 rounded ${currentReviewPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                          onClick={() => setCurrentReviewPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-blue-100 disabled:opacity-50"
                        onClick={() => setCurrentReviewPage(p => Math.min(Math.ceil(reviews.length / REVIEWS_PER_PAGE), p+1))}
                        disabled={currentReviewPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE)}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Similar Products Section */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Similar Products
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Section */}
          {recentlyViewed && recentlyViewed.length > 1 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recently Viewed
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyViewed.filter(p => p._id !== product?._id).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage; 