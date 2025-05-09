import { Link } from 'react-router-dom';

const TopProductsList = ({ products = [] }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Top Selling Products</h3>
        <div className="mt-5">
          {products.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No products data available</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={product.image || `/images/placeholder.jpg`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.sold} sold
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <Link to="/admin/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopProductsList; 