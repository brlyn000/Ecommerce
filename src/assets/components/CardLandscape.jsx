import imageAbout from "../image/bannerAboutUs/bannerAboutUs.png"

export default function CardLandscape() {
  return (
    <div className="relative overflow-hidden py-20 px-5 sm:px-6 lg:px-24 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image with frame effect */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400 to-blue-600 rounded-2xl opacity-30 group-hover:opacity-50 blur-md transition-all duration-500"></div>
            <img 
              className="relative w-full h-auto rounded-xl shadow-2xl object-cover transform group-hover:-translate-y-1 transition-transform duration-300 border-4 border-white" 
              src={imageAbout} 
              alt="About Ekraf Market"
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>

          {/* Content with animated elements */}
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-sky-400 rounded-full opacity-10"></div>
            
            <h1 className="mb-8 text-3xl font-extrabold text-gray-900 md:text-4xl lg:text-5xl text-center lg:text-left">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 animate-gradient-x">
                Tentang Kami
              </span>
            </h1>
            
            <div className="space-y-6 text-gray-700 text-lg">
              <p className="relative z-10 leading-relaxed">
                <span className="absolute -left-4 top-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                Ekraf Market lahir dari semangat kolaboratif mahasiswa untuk menciptakan ekosistem digital yang mendukung pertumbuhan ekonomi kreatif di lingkungan kampus. Website ini dirancang sebagai ruang jual-beli yang tidak hanya menjual produk, tetapi juga menjual nilai: kreativitas, inovasi, dan semangat kemandirian mahasiswa.
              </p>
              
              <p className="relative z-10 leading-relaxed">
                <span className="absolute -left-4 top-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                Dengan hadirnya Ekraf Market, mahasiswa dari berbagai jurusan dapat memasarkan produk mereka baik dalam bentuk fisik seperti makanan, kerajinan, merchandise, maupun produk digital seperti desain grafis, jasa editing, ilustrasi, dan lainnya.
              </p>
              
              <p className="relative z-10 leading-relaxed">
                <span className="absolute -left-4 top-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                Kami percaya bahwa mahasiswa tidak hanya sebagai konsumen teknologi, tetapi juga produsen nilai ekonomi. Ekraf Market menjadi jembatan antara kreativitas mahasiswa dan kebutuhan pasar, sekaligus melatih keterampilan digital, komunikasi bisnis, dan pengelolaan usaha secara riil.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="hidden lg:block absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-r from-sky-300 to-blue-400 rounded-full opacity-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}