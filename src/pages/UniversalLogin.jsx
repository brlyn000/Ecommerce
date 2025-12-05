import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiLock, FiShield, FiHome, FiUsers } from 'react-icons/fi'

export default function UniversalLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5006/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        
        console.log('Login successful, user role:', data.user.role)
        
        // Redirect based on role
        switch (data.user.role) {
          case 'admin':
            console.log('Redirecting admin to dashboard')
            window.location.href = '/dashboard'
            break
          case 'tenant':
            console.log('Redirecting tenant to tenant-dashboard')
            window.location.href = '/tenant-dashboard'
            break
          case 'user':
          default:
            // Redirect to last visited page or home
            const lastPage = localStorage.getItem('lastVisitedPage') || '/'
            console.log('User login - redirecting to:', lastPage)
            window.location.href = lastPage
            break
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
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
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <FiShield className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Login</h1>
          <p className="text-blue-200">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
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
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Password"
                required
              />
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-4">
          <p className="text-blue-200 text-sm">
            Belum punya akun?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Daftar di sini
            </a>
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <a href="/user-register" className="flex items-center justify-center space-x-1 text-green-400 hover:text-green-300 bg-white/5 rounded-lg py-2">
              <FiUsers className="w-3 h-3" />
              <span>Daftar User</span>
            </a>
            <a href="/tenant-register" className="flex items-center justify-center space-x-1 text-orange-400 hover:text-orange-300 bg-white/5 rounded-lg py-2">
              <FiHome className="w-3 h-3" />
              <span>Daftar Tenant</span>
            </a>
          </div>
          
          <a href="/" className="text-xs text-gray-400 hover:text-gray-300">
            ← Kembali ke Beranda
          </a>
        </div>
      </motion.div>
    </div>
  )
}