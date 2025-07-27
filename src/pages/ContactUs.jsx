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

      // Menggunakan FormData asli untuk pengiriman
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: formData,
        redirect: 'follow'
      });

      // Karena Google Apps Script mengembalikan redirect
      // Kita tidak bisa membaca response langsung di frontend
      // Jadi kita anggap berhasil jika tidak ada error
      setSubmitStatus({ 
        success: true, 
        message: 'Pesan berhasil dikirim! Kami akan segera menghubungi Anda.' 
      });
      form.current.reset();

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi atau hubungi kami melalui alternatif lain.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-700 to-blue-600 text-white min-h-screen">
        {/* Floating decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-semibold text-blue-300 tracking-wider uppercase mb-3">
              Hubungi Kami
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 mb-4">
              Mari Berkolaborasi
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-blue-100">
              Punya pertanyaan atau ingin bekerja sama? Tim kami siap membantu Anda kapan saja.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold mb-6 text-blue-300">Informasi Kontak</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-600/20 p-3 rounded-lg">
                      <FaPhoneAlt className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">Telepon</h4>
                      <p className="mt-1 text-blue-100">+62 123 4567 8910</p>
                      <p className="mt-1 text-sm text-blue-300/80">Senin - Jumat</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-600/20 p-3 rounded-lg">
                      <FaEnvelope className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">Email</h4>
                      <p className="mt-1 text-blue-100">polteksi.ac.id</p>
                      <p className="mt-1 text-sm text-blue-300/80">Respon dalam 24 jam kerja</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-600/20 p-3 rounded-lg">
                      <FaMapMarkerAlt className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">Lokasi</h4>
                      <p className="mt-1 text-blue-100">Jl. Kartini No.25 C, Kesemen, Sukorame</p>
                      <p className="mt-1 text-sm text-blue-300/80"> Kec. Gresik, Kabupaten Gresik, Jawa Timur</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700/50">
                  <h4 className="text-lg font-medium mb-4 text-blue-300">Media Sosial</h4>
                  <div className="flex gap-3">
                    <a 
                      href="https://wa.me/6212345678910" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600/30 hover:bg-blue-600/50 p-3 rounded-full transition-colors duration-300"
                    >
                      <FaWhatsapp className="h-5 w-5 text-blue-300" />
                    </a>
                    <a 
                      href="https://t.me/username" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600/30 hover:bg-blue-600/50 p-3 rounded-full transition-colors duration-300"
                    >
                      <FaTelegramPlane className="h-5 w-5 text-blue-300" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 aspect-video">
                <iframe 
                  title="Peta Lokasi Kantor"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4773.04283097361!2d112.6418161!3d-7.1680142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd8015caf06204d%3A0x89b3f2c706b82021!2sPoliteknik%20semen%20Indonesia%20(%20Poltek-Si%20)!5e1!3m2!1sid!2sid!4v1753595290027!5m2!1sid!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-b-2xl"
                ></iframe>
              </div>

            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-2xl font-bold mb-6 text-blue-300">Kirim Pesan</h3>
              
              {submitStatus && (
                <div className={`mb-4 p-3 rounded-lg ${submitStatus.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                  {submitStatus.message}
                </div>
              )}
              
              <form ref={form} onSubmit={sendEmail} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="user_name" className="block text-sm font-medium text-blue-100 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      id="user_name"
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                  <div>
                    <label htmlFor="user_email" className="block text-sm font-medium text-blue-100 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="user_email"
                      id="user_email"
                      required
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-blue-100 mb-2">
                    Subjek
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Apa yang bisa kami bantu?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-blue-100 mb-2">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Tulis pesan Anda disini..."
                  ></textarea>
                </div>
                
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'
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
                        <FaTelegramPlane className="mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;