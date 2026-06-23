import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiLock, FiX } from 'react-icons/fi'
import { API_BASE_URL } from '../../config/api'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          onClose()
          window.location.reload()
        }
      } else {
        setError('Username atau password salah')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative mx-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Masuk</h2>
              <p className="text-gray-600">Masuk ke akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Username atau Email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>

              <div className="text-center text-sm text-gray-600">
                Belum punya akun?{' '}
                <a href="/user-register" className="text-red-600 hover:text-red-700 font-medium">
                  Daftar di sini
                </a>
              </div>
              
              <div className="text-center text-xs text-gray-500 mt-2">
                Login diperlukan untuk menyukai produk
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}