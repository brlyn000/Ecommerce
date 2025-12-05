import Navbar from "../assets/components/Navbar";
import Carousel from '../assets/components/Carousel';
import HeadingTypography from "../assets/components/HeadingTypography";
import CardProduct from "../assets/components/CardProduct";
import CategoryCard from "../assets/components/CategoryCard";
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    
    // Auto refresh categories every 60 seconds
    const interval = setInterval(fetchCategories, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen pb-20 md:pb-0">
      {/* Enhanced Background Ornaments */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated floating circles */}
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 sm:top-20 -left-10 sm:-left-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 blur-3xl"
        ></motion.div>
        <motion.div 
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-10 sm:-right-20 w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-purple-200/25 to-pink-200/20 blur-3xl"
        ></motion.div>
        <motion.div 
          animate={{ 
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-indigo-200/20 to-blue-200/15 blur-3xl"
        ></motion.div>
        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      </div>

      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="my-4 sm:my-6 lg:my-8 relative z-10"
        >
          <div className="relative">
            {/* Decorative elements around carousel */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-50 animate-pulse delay-1000"></div>
            <div className="absolute -bottom-6 left-1/4 w-4 h-4 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full opacity-40 animate-pulse delay-500"></div>
            
            <Carousel />
          </div>
        </motion.section>

        {/* Enhanced Category Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative py-8 sm:py-12 lg:py-16"
        >
          {/* Enhanced background decoration */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 -z-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"
            ></motion.div>
          </div>
          
          {/* Section header with enhanced styling */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <HeadingTypography text='Kategori Produk'/>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                Temukan berbagai kategori produk berkualitas yang sesuai dengan kebutuhan Anda
              </p>
            </motion.div>
          </div>
          
          {/* Enhanced category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {loading ? (
              // Loading skeleton
              [...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <CategoryCard 
                    category={category} 
                    className="transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group-hover:bg-white/80 backdrop-blur-sm"
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Tidak ada kategori tersedia</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Enhanced Featured Products */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative py-6 sm:py-8 lg:py-12"
        >
          {/* Enhanced background decoration */}
          <div className="absolute -bottom-20 right-0 -z-10">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-sky-500/10 to-blue-500/10 rounded-full blur-3xl"
            ></motion.div>
          </div>
          
          <CardProduct />
        </motion.section>
      </div>

      {/* Enhanced floating decorative elements */}
      <motion.div 
        animate={{ 
          x: [0, 20, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="fixed -bottom-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-3xl -z-10"
      ></motion.div>
      <motion.div 
        animate={{ 
          x: [0, -15, 0],
          y: [0, 25, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="fixed top-1/3 -left-20 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-sky-400/15 to-indigo-400/10 rounded-full blur-3xl -z-10"
      ></motion.div>
      
      {/* Additional mobile-specific decorations */}
      <div className="block sm:hidden fixed bottom-4 left-4 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse"></div>
      <div className="block sm:hidden fixed top-1/4 right-4 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-pulse delay-1000"></div>
    </div>
  );
};