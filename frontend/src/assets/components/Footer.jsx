const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Ekraf Market</h3>
            <p className="text-red-100 mb-4 leading-relaxed">
              Empowering student creativity through innovation, entrepreneurship, and a collaborative digital marketplace.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                <span className="text-sm font-bold">i</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-red-100">
              <li><a href="/" className="hover:text-white transition-colors">Beranda</a></li>
              <li><a href="/about-us" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="/contact-us" className="hover:text-white transition-colors">Kontak Kami</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Masuk</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak Kami</h4>
            <div className="space-y-2 text-red-100">
              <p>ekrafpolteksi@gmail.com</p>
              <p>+62 857-0803-4963</p>
              <p>Gresik, Jl. Kartini No.25 C</p>
              <p>24/7 Customer Support</p>
            </div>
          </div>
        </div>

        <div className="border-t border-red-500/30 mt-8 pt-8 text-center">
          <p className="text-red-100">
            © 2026 Ekraf Market Platform. All rights reserved. <br />Empowering student creativity through innovation and entrepreneurship.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
