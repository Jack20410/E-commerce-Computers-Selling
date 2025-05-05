const Banner = () => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxMC4wMzcgMCAxOC04LjA1OSAxOC0xOHMtNy45NjMtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6Ii8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      {/* Main gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/70 to-black/80 z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="relative z-20 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-transparent transform translate-x-1/2"
            fill="url(#gradient)"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
            <div className="sm:text-center lg:text-left px-4 sm:px-8 xl:pl-12">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 animate-fade-in">Premium Tech for</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 animate-pulse">Every Budget</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 leading-relaxed">
                From custom-built gaming PCs to professional workstations, we have the perfect tech solution for your needs. Shop our wide range of computers, components, and peripherals.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow-lg">
                  <a
                    href="#"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transform hover:scale-105 transition-all duration-300 ease-in-out md:py-4 md:text-lg md:px-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="relative h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full">
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply z-10"></div>
          <img
            className="h-full w-full object-cover filter brightness-110 contrast-110 transform hover:scale-105 transition-transform duration-700 ease-in-out"
            src="https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
            alt="High-performance gaming computer setup"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner; 