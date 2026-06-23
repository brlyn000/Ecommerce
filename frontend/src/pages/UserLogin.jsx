import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiLock, FiShoppingBag } from 'react-icons/fi'
import { API_BASE_URL } from '../config/api'

export default function UserLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

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
        if (data.user.role === 'user') {
          localStorage.setItem('adminToken', data.token)
          window.dispatchEvent(new Event('userLoggedIn'))
          setTimeout(() => {
            window.location.href = '/'
          }, 100)
        } else {
          setError('Akses ditolak. Halaman ini khusus untuk user.')
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-teal-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <FiShoppingBag className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">User Login</h1>
          <p className="text-green-200">Masuk sebagai pembeli</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Username atau Email"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-300"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-green-200 text-sm">
            Belum punya akun?{' '}
            <a href="/user-register" className="text-green-400 hover:text-green-300 font-medium">
              Daftar User
            </a>
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <a href="/tenant-login" className="text-blue-400 hover:text-blue-300">Login Tenant</a>
            <a href="/login" className="text-purple-400 hover:text-purple-300">Login Admin</a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}