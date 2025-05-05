const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Ultimate Gaming PC',
      category: 'Pre-built PC',
      price: 1999.99,
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'High-performance gaming rig with RGB lighting and liquid cooling',
    },
    {
      id: 2,
      name: 'Business Laptop Pro',
      category: 'Laptop',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'Powerful and lightweight laptop for business professionals',
    },
    {
      id: 3,
      name: 'RTX 4080 Graphics Card',
      category: 'Graphics Card',
      price: 799.99,
      image: 'https://images.unsplash.com/photo-1591488320469-0e0b4263cb53?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'Next-gen graphics card for ultimate gaming performance',
    },
    {
      id: 4,
      name: 'Mechanical Gaming Keyboard',
      category: 'Peripherals',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'RGB mechanical keyboard with customizable switches',
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="relative inline-block">
              <span className="relative z-10">Featured Products</span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded"></span>
            </span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Explore our selection of top-rated tech products
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative w-full h-60 bg-gray-200 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-0 right-0 p-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="px-5 py-5">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  <a href="#">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            View All Products
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts; 