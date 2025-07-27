import { useState, useEffect, useRef } from 'react';
import carouselData from '../../data/CarouselData';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const intervalRef = useRef();

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => 
      prev === 0 ? carouselData.length - 1 : prev - 1
    );
    setTimeout(() => setIsAnimating(false), 800);
  };

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => 
      prev === carouselData.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide();
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isHovered) nextSlide();
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isHovered, currentIndex]);

  return (
    <div
      className="relative max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Container */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem]">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10"></div>

        {/* Images */}
        <div className="relative h-full w-full">
          {carouselData.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={item.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === currentIndex ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Text Overlay */}
        <div className={`absolute bottom-8 left-8 z-20 text-white max-w-md transition-all duration-500 ${
          isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
            {carouselData[currentIndex].title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-md">
            {carouselData[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className={`absolute top-1/2 left-4 transform -translate-y-1/2 z-20 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } group`}
        aria-label="Previous slide"
      >
        <FiChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className={`absolute top-1/2 right-4 transform -translate-y-1/2 z-20 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 shadow-lg ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } group`}
        aria-label="Next slide"
      >
        <FiChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {carouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white/70 w-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}