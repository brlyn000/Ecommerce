export default function Jumbotron() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-200/40 to-red-300/20 blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-red-100/30 to-white/20 blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
        <div className="mb-6 animate-fade-in">
          <span className="text-sm font-semibold tracking-wider text-red-500 uppercase">
            Platform E-Commerce Mahasiswa
          </span>
        </div>
        
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-tight text-gray-900 md:text-5xl lg:text-6xl animate-slide-up">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">
            Ekraf Market
          </span>
          <br className="hidden md:block" />
          <span>E-Commerce Mahasiswa Kreatif & Mandiri</span>
        </h1>
        
        <p className="mx-auto mb-8 text-lg font-normal text-gray-600 lg:text-xl max-w-2xl leading-relaxed animate-fade-in delay-100">
          Platform e-commerce pertama di kampus yang berfokus pada pengembangan potensi wirausaha kreatif mahasiswa. 
          Dikelola oleh dan untuk mahasiswa, kami menyediakan ruang digital bagi kreator muda untuk menjual produk, 
          membangun brand, dan berkembang bersama.
        </p>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4 animate-fade-in delay-200">
          <a 
            href="/" 
            className="relative inline-flex justify-center items-center py-4 px-8 text-base font-medium text-center text-white rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            <span className="relative z-10">Get Started</span>
            <svg className="w-4 h-4 ms-2 rtl:rotate-180 group-hover:translate-x-1 transition-transform" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </a>
          
          <a 
            href="#" 
            className="relative inline-flex justify-center items-center py-4 px-8 text-base font-medium text-center text-gray-700 rounded-lg border-2 border-red-200 hover:border-red-400 bg-white hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Learn More
          </a>  
        </div>
        
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 animate-fade-in delay-300">
          {[
            { value: "500+", label: "Mahasiswa Bergabung" },
            { value: "50+", label: "Produk Kreatif" },
            { value: "24/7", label: "Dukungan" },
            { value: "100%", label: "Mahasiswa" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-red-600 sm:text-4xl">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
