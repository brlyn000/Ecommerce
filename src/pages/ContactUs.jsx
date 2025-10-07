import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import Navbar from '../assets/components/Navbar';

const ContactUs = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData(form.current);
      const data = Object.fromEntries(formData.entries());

      // URL endpoint Google Apps Script
      const scriptUrl = import.meta.env.VITE_APP_SCRIPT_URL || 
        'https://script.google.com/macros/s/AKfycbzbTKxxtJsZYE1yIqbgA82ewg0qFoF7v06g4rwEH1bqkH063JXNOvXhoyOx00rR7D1C/exec';

      // Menggunakan FormData asli untuk pengiriman dengan CSRF protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: formData,
        redirect: 'follow',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin
        },
        credentials: 'same-origin',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSubmitStatus({ 
        success: true, 
        message: 'Pesan berhasil dikirim! Kami akan segera menghubungi Anda.' 
      });
      form.current.reset();

    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Terjadi kesalahan saat mengirim pesan.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Koneksi timeout. Silakan periksa koneksi internet Anda.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Server tidak dapat diakses. Silakan coba lagi nanti.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      
      setSubmitStatus({ 
        success: false, 
        message: `${errorMessage} Atau hubungi kami melalui alternatif lain.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white min-h-screen">
        {/* Enhanced floating decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
          {/* Enhanced Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm font-semibold text-blue-400 tracking-widest uppercase mb-3 sm:mb-4"
            >
              Hubungi Kami
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 mb-4 sm:mb-6 leading-tight"
            >
              Mari Berkolaborasi
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed px-4"
            >
              Punya pertanyaan atau ingin bekerja sama? Tim kami siap membantu Anda kapan saja.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Enhanced Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 sm:space-y-6 order-2 xl:order-1"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Informasi Kontak</h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent hover:from-blue-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <FaPhoneAlt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-white">Telepon</h4>
                      <p className="mt-1 text-sm sm:text-base text-blue-200 font-medium">+62 123 4567 8910</p>
                      <p className="mt-1 text-xs sm:text-sm text-blue-300/80">Senin - Jumat, 08:00 - 17:00</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent hover:from-purple-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-white">Email</h4>
                      <p className="mt-1 text-sm sm:text-base text-blue-200 font-medium break-all">polteksi.ac.id</p>
                      <p className="mt-1 text-xs sm:text-sm text-blue-300/80">Respon dalam 24 jam kerja</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-transparent hover:from-green-500/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 p-2 sm:p-3 rounded-lg shadow-lg">
                      <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-white">Lokasi</h4>
                      <p className="mt-1 text-sm sm:text-base text-blue-200 leading-relaxed">Jl. Kartini No.25 C, Kesemen, Sukorame</p>
                      <p className="mt-1 text-xs sm:text-sm text-blue-300/80">Kec. Gresik, Kabupaten Gresik, Jawa Timur</p>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                  <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Media Sosial</h4>
                  <div className="flex gap-3 sm:gap-4">
                    <motion.a 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://wa.me/6212345678910" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 p-3 sm:p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                    >
                      <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://t.me/username" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 p-3 sm:p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                    >
                      <FaTelegramPlane className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </motion.a>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 aspect-video"
              >
                <iframe 
                  title="Peta Lokasi Kantor"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4773.04283097361!2d112.6418161!3d-7.1680142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd8015caf06204d%3A0x89b3f2c706b82021!2sPoliteknik%20semen%20Indonesia%20(%20Poltek-Si%20)!5e1!3m2!1sid!2sid!4v1753595290027!5m2!1sid!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl sm:rounded-3xl"
                ></iframe>
              </motion.div>

            </motion.div>

            {/* Enhanced Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 order-1 xl:order-2"
            >
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Kirim Pesan</h3>
              
              {submitStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border ${submitStatus.success ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'} backdrop-blur-sm`}
                >
                  <p className="text-sm sm:text-base font-medium">{submitStatus.message}</p>
                </motion.div>
              )}
              
              <form ref={form} onSubmit={sendEmail} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="user_name" className="block text-sm font-semibold text-blue-200 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      id="user_name"
                      required
                      className="w-full px-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-300/60 transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
                      placeholder="Masukkan nama Anda"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="user_email" className="block text-sm font-semibold text-blue-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="user_email"
                      id="user_email"
                      required
                      className="w-full px-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-300/60 transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
                      placeholder="email@contoh.com"
                    />
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="subject" className="block text-sm font-semibold text-blue-200 mb-2">
                    Subjek
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    className="w-full px-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-300/60 transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
                    placeholder="Apa yang bisa kami bantu?"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="message" className="block text-sm font-semibold text-blue-200 mb-2">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-300/60 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 resize-none"
                    placeholder="Tulis pesan Anda disini..."
                  ></textarea>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-400 text-white font-bold py-3 sm:py-4 px-6 rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center text-sm sm:text-base ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-purple-500/25 hover:shadow-2xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      <>
                        <FaTelegramPlane className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Kirim Pesan
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>
          
          {/* Additional decorative elements for mobile */}
          <div className="block sm:hidden absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;