const Categories = () => {
  const categories = [
    {
      id: 1,
      name: 'Pre-built PCs',
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'Ready-to-go gaming and workstation PCs',
    },
    {
      id: 2,
      name: 'Laptops',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'Gaming, business, and everyday laptops',
    },
    {
      id: 3,
      name: 'CPUs',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'Processors from Intel and AMD',
    },
    {
      id: 4,
      name: 'Graphics Cards',
      image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'NVIDIA and AMD GPUs for gaming and content creation',
    },
    {
      id: 5,
      name: 'Gears',
      image: 'https://images.unsplash.com/photo-1594380128001-8eed5d4b7a5c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'Keyboards, mice, monitors, and more',
    },
    {
      id: 6,
      name: 'Storage',
      image: 'https://images.unsplash.com/photo-1615293889206-74747b8e2ff5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      description: 'SSDs, HDDs, and external storage solutions',
    },
  ];

  return (
    <div className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Find exactly what you need for your next build or upgrade
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              href="#"
              key={category.id}
              className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {category.description}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center text-blue-600 group-hover:text-blue-800">
                    Shop now
                    <svg
                      className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories; 