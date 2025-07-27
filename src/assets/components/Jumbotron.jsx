export default function Jumbotron() {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Background with overlay and animated gradient */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop" 
          alt="Background" 
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-gray-900/0"></div>
      </div>

      <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
        {/* Animated text */}
        <div className="mb-6 animate-fade-in">
          <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase">
            Platform E-Commerce Mahasiswa
          </span>
        </div>
        
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-tight text-white md:text-5xl lg:text-6xl animate-slide-up">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-300">
            Ekraf Market
          </span>
          <br className="hidden md:block" />
          <span>E-Commerce Mahasiswa Kreatif & Mandiri</span>
        </h1>
        
        <p className="mx-auto mb-8 text-lg font-normal text-gray-300 lg:text-xl max-w-2xl leading-relaxed animate-fade-in delay-100">
          Platform e-commerce pertama di kampus yang berfokus pada pengembangan potensi wirausaha kreatif mahasiswa. 
          Dikelola oleh dan untuk mahasiswa, kami menyediakan ruang digital bagi kreator muda untuk menjual produk, 
          membangun brand, dan berkembang bersama.
        </p>
        
        {/* Buttons with hover effects */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4 animate-fade-in delay-200">
          <a 
            href="/" 
            className="relative inline-flex justify-center items-center py-4 px-8 text-base font-medium text-center text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg className="w-4 h-4 ms-2 rtl:rotate-180 group-hover:translate-x-1 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </a>
          
          <a 
            href="#" 
            className="relative inline-flex justify-center items-center py-4 px-8 text-base font-medium text-center text-white rounded-lg border-2 border-white/20 hover:border-white/40 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <span className="relative z-10">Learn More</span>
            <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>  
        </div>
        
        {/* Stats counter */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 animate-fade-in delay-300">
          {[
            { value: "500+", label: "Mahasiswa Bergabung" },
            { value: "50+", label: "Produk Kreatif" },
            { value: "24/7", label: "Dukungan" },
            { value: "100%", label: "Mahasiswa" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
              <div className="text-sm font-medium text-gray-300 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}