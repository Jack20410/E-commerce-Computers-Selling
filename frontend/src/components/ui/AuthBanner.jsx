const AuthBanner = () => {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxMC4wMzcgMCAxOC04LjA1OSAxOC0xOHMtNy45NjMtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6Ii8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      {/* Main gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/70 to-black/80"></div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 animate-fade-in">
            TechStation
          </span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 animate-pulse">
            Computer Store
          </span>
        </h1>
        <p className="text-gray-300 text-center text-lg md:text-xl max-w-2xl mb-8">
          Discover the world of technology with high-quality products and professional service
        </p>
        <div className="grid grid-cols-2 gap-6 text-center text-gray-300">
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-sm">Products</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-sm">Customer Support</div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/50 to-transparent"></div>
    </div>
  );
};

export default AuthBanner; 