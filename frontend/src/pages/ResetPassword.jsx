import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL as API } from '../config/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Token tidak valid. Silakan minta link reset baru.');
  }, [token]);

  const passwordsMatch = confirm && password === confirm;
  const passwordsMismatch = confirm && password !== confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Password tidak cocok');
    if (password.length < 6) return setError('Password minimal 6 karakter');

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Gagal mereset password');
      }
    } catch {
      setError('Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center"
        >
          <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Direset!</h2>
          <p className="text-gray-500 mb-6">Silakan login dengan password baru kamu.</p>
          <button
            onClick={() => {
              localStorage.removeItem('lastVisitedPage');
              window.location.href = '/login';
            }}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Login Sekarang
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Buat Password Baru</h2>
          <p className="text-gray-500 mt-2 text-sm">Masukkan password baru untuk akun kamu.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Min. 6 karakter"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  passwordsMismatch ? 'border-red-400 bg-red-50' :
                  passwordsMatch ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="Ulangi password baru"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {passwordsMismatch && <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>}
            {passwordsMatch && <p className="text-xs text-green-500 mt-1">Password cocok ✓</p>}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <span className="text-red-500">⚠</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
