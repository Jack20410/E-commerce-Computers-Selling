import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import { formatVND } from '../utils/currencyFormatter';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';

// Rating Stars Component
const RatingStars = ({ rating = 0, totalRatings = 0 }) => (
  <div className="flex items-center">
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <span className="ml-2 text-gray-600">({totalRatings} reviews)</span>
  </div>
);

// Product Card Component for Similar Products
const ProductCard = ({ product }) => (
  <Link to={`/products/${product._id}`} className="group">
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-105">
      <div className="aspect-w-1 aspect-h-1 w-full">
        <img
          src={product.images?.[0]?.url ? getImageUrl(product.images[0].url) : getPlaceholderImage(product.category)}
          alt={`${product.brand} ${product.model}`}
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.brand} {product.model}</h3>
        <p className="mt-1 text-lg font-semibold text-blue-600">{formatVND(product.price)}</p>
      </div>
    </div>
  </Link>
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
      <h2 className="text-2xl font-bold mb-4">Specifications</h2>
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
        <div className="w-12 text-sm text-gray-600">{star} stars</div>
        <div className="flex-1 mx-4 h-4 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-yellow-400"
            style={{ width: `${(ratings[star] || 0)}%` }}
          />
        </div>
        <div className="w-12 text-sm text-gray-600">{ratings[star]}%</div>
      </div>
    ))}
  </div>
);

// Sample review data
const sampleReviews = [
  {
    id: 1,
    userName: "John Smith",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 5,
    date: "2024-03-01",
    purchaseVerified: true,
    comment: "Excellent product! The performance is outstanding, and it runs all my games at max settings without breaking a sweat. The build quality is top-notch, and the RGB lighting looks amazing.",
    helpfulCount: 24,
    images: [
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&h=200&q=80",
    ]
  },
  {
    id: 2,
    userName: "Sarah Johnson",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    rating: 4,
    date: "2024-02-28",
    purchaseVerified: true,
    comment: "Great value for money. The only minor issue is that it runs a bit hot under heavy load, but that's expected with this level of performance.",
    helpfulCount: 15
  },
  {
    id: 3,
    userName: "Michael Chen",
    rating: 5,
    date: "2024-02-25",
    purchaseVerified: true,
    comment: "Perfect upgrade for my setup. Installation was straightforward, and the performance boost is noticeable. Customer service was also very helpful with my questions.",
    helpfulCount: 8
  }
];

// Sample rating distribution data
const sampleRatingDistribution = {
  5: 65,
  4: 20,
  3: 10,
  2: 3,
  1: 2
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

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

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      // Optionally show a success message or redirect to cart
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

  return (
    <>
      <Helmet>
        <title>{`${product.brand} ${product.model} | Computer Store`}</title>
        <meta name="description" content={product.description} />
      </Helmet>
      
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-4">
        <div className="container mx-auto px-3 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-xs">
              <li><Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link to="/products" className="text-gray-500 hover:text-blue-600 transition-colors">Products</Link></li>
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
                  <RatingStars rating={4.5} totalRatings={128} />
                  <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                    128 Reviews
                  </span>
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
              
              <div className="border-t border-b border-gray-100 py-3">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
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
              Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Rating */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">4.5</div>
                  <RatingStars rating={4.5} totalRatings={128} />
                  <p className="text-xs text-gray-500 mt-2">Based on 128 reviews</p>
                </div>
                <RatingDistribution ratings={sampleRatingDistribution} />
                <button className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Customer Feedback</h3>
                  <div className="flex items-center space-x-3">
                    <label className="text-xs text-gray-600">Sort by:</label>
                    <select className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-xs 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                      <option>Most Recent</option>
                      <option>Highest Rated</option>
                      <option>Lowest Rated</option>
                      <option>Most Helpful</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  {sampleReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="group flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <span>Load More Reviews</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.length > 0 ? (
                similarProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                // Loading placeholders
                [...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-3 transform hover:scale-105 transition-transform duration-200">
                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Viewed Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Placeholder for recently viewed products */}
              <div className="bg-white rounded-lg shadow-md p-3 transform hover:scale-105 transition-transform duration-200">
                <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg mb-3 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
              {/* Repeat placeholder 3 more times */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage; 