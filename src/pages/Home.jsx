import Navbar from "../assets/components/Navbar";
import Carousel from '../assets/components/Carousel';
import HeadingTypography from "../assets/components/HeadingTypography";
import CardProduct from "../assets/components/CardProduct";
import CategoryCard from "../assets/components/CategoryCard";
import CategoriesData from "../data/CategoriesData";

export const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-blue-100/20 blur-2xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-sky-100/30 blur-3xl"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
      </div>

      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="my-5 relative z-10">
          <Carousel />
        </section>

        {/* Category Section */}
        <section className="relative py-12">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 -z-10">
            <div className="w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <HeadingTypography text='Kategori Produk'/>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {CategoriesData.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                className="hover:scale-105 transition-transform duration-300"
              />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="relative py-3">
          <div className="absolute -bottom-20 right-0 -z-10">
            <div className="w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
          </div>
        <CardProduct />
        </section>
      </div>

      {/* Floating decorative elements */}
      <div className="fixed -bottom-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed top-1/3 -left-20 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};