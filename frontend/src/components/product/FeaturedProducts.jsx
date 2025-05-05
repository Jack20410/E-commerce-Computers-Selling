import { formatVND } from '../../utils/currencyFormatter';

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Ultimate Gaming PC',
      category: 'Pre-built PC',
      price: 199999999,
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
      id: 2,
      name: 'Business Laptop Pro',
      category: 'Laptop',
      price: 129999,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
    {
      id: 3,
      name: 'RTX 4080 Graphics Card',
      category: 'Graphics Card',
      price: 79999,
      image: 'https://www.tncstore.vn/media/product/250-9803-rtx-asus-25.png',
    },
    {
      id: 4,
      name: 'Mechanical Gaming Keyboard',
      category: 'Gears',
      price: 1499999,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Featured Products
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Explore our selection of top-rated tech products
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[450px] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></div>
              
              <div className="relative h-[250px]">
                <div className="absolute inset-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-sm font-medium text-white shadow-lg">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 p-6">
                <h3 className="text-base text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg text-gray-900">
                      {formatVND(product.price)}
                    </span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 