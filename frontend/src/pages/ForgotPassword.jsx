import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setDevUrl('');

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        if (data.dev_reset_url) setDevUrl(data.dev_reset_url);
      } else {
        setError(data.message || 'Gagal memproses permintaan');
      }
    } catch {
      setError('Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8"
      >
        <Link to="/login" className="flex items-center text-gray-500 hover:text-gray-700 text-sm mb-6">
          <FiArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Lupa Password?</h2>
          <p className="text-gray-500 mt-2 text-sm">Masukkan email akun kamu dan kami akan mengirim link reset.</p>
        </div>

        {message ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">{message}</p>
              <p className="text-green-600 text-sm mt-1">Cek inbox email kamu.</p>
            </div>

            {devUrl && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-xs font-bold mb-2">⚠️ MODE DEV — SMTP belum dikonfigurasi</p>
                <p className="text-yellow-700 text-xs mb-2">Gunakan link berikut untuk reset password:</p>
                <a
                  href={devUrl}
                  className="text-blue-600 text-xs break-all underline hover:text-blue-800"
                >
                  {devUrl}
                </a>
              </div>
            )}

            <Link to="/login" className="block text-center text-sm text-red-600 hover:text-red-700 font-medium mt-2">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <span className="text-red-500">⚠</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
