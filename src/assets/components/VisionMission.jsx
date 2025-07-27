export default function VisionMission() {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with animated gradient */}
        <div className="text-center mb-12">
          <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 animate-gradient-x">
              Visi & Misi
            </span>
          </h1>
          <p className="mx-auto text-xl md:text-2xl font-semibold text-slate-700 max-w-4xl leading-relaxed p-6 rounded-xl">
            "Menjadi platform e-commerce mahasiswa terdepan yang memberdayakan ekonomi kreatif, 
            membangun semangat kemandirian, dan memperkuat budaya kolaborasi digital kampus"
          </p>
        </div>

        {/* Mission cards with hover effects */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* First column */}
          <div className="space-y-6">
            {[
              "Menyediakan platform jual-beli digital untuk mahasiswa yang mudah, aman, dan berkelanjutan.",
              "Mendorong mahasiswa untuk mengembangkan produk dan jasa berbasis kreativitas serta kebutuhan pasar.",
              "Membentuk komunitas wirausaha muda kampus yang aktif berbagi pengalaman dan berkolaborasi."
            ].map((item, index) => (
              <MissionCard key={index} index={index + 1} text={item} />
            ))}
          </div>
          
          {/* Second column */}
          <div className="space-y-6">
            {[
              "Menyediakan edukasi seputar kewirausahaan digital, branding, marketing, dan literasi keuangan.",
              "Menghubungkan mahasiswa dengan mitra, sponsor, dan lembaga yang mendukung pertumbuhan ekonomi kreatif."
            ].map((item, index) => (
              <MissionCard key={index + 3} index={index + 4} text={item} />
            ))}
            
            {/* Visual element */}
            <div className="hidden lg:block relative h-full min-h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl opacity-80"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400 rounded-tl-full opacity-30"></div>
              <div className="absolute top-0 left-0 w-24 h-24 bg-sky-300 rounded-br-full opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Reusable Mission Card Component
function MissionCard({ index, text }) {
  return (
    <div className="group relative p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-400 hover:border-blue-600">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">
            {index}
          </div>
        </div>
        <p className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
          {text}
        </p>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-500"></div>
    </div>
  )
}