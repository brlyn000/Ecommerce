import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconMapper';

export default function CategoryCard({ category, className = '' }) {
  const Icon = getIcon(category.icon);

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 transition-all duration-300 border border-gray-200/50 hover:border-blue-300/60 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 flex-1 min-w-[120px] sm:min-w-0 ${className}`}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/60 via-cyan-50/40 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-2xl rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <Link to={category.link} className="relative flex flex-col items-center gap-3 h-full text-center">
        {/* Enhanced animated icon */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 group-hover:from-blue-200 group-hover:via-blue-100 group-hover:to-cyan-100 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg mb-1"
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:text-blue-700 transition-colors" />
        </motion.div>

        {/* Enhanced content */}
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-1">
            {category.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* Enhanced hover indicator */}
        <motion.div 
          initial={{ width: 0 }}
          whileHover={{ width: '60%' }}
          className="h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full transition-all duration-300 mt-2"
        />
      </Link>

      {/* Floating particles effect */}
      <div className="absolute top-2 left-2 w-1 h-1 bg-blue-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
      <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
      <div className="absolute bottom-3 left-3 w-1 h-1 bg-indigo-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"></div>
    </motion.div>
  );
}