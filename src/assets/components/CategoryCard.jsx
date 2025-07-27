import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  const Icon = category.icon;

  return (
    
    <div className="group relative bg-white rounded-xl p-3 sm:p-4 transition-all duration-300 border border-gray-200 hover:border-blue-300 shadow-xs hover:shadow-sm flex-1 min-w-[100px] sm:min-w-0">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/50 to-yellow-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      
      <Link to={category.link} className="flex flex-col sm:flex-row items-center gap-3 h-full">
        {/* Animated icon */}
        <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 flex items-center justify-center transition-all duration-300 shadow-inner">
          <Icon className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
        </div>

        {/* Content */}
        <div className="text-center sm:text-left flex-1">
          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
            {category.name}
          </h3>
          {/* Hidden on mobile */}
          <p className="hidden sm:block text-xs text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {category.description}
          </p>
        </div>

        {/* Desktop-only arrow */}
        <svg 
          className="hidden sm:block w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Animated indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-[80%] transition-all duration-300"></div>
    </div>
  );
}