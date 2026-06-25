import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShield, FiX, FiMail } from 'react-icons/fi'
import { API_BASE_URL as API_BASE } from '../config/api'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

export default function UniversalLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState('email')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const { signIn: googleSignIn } = useGoogleAuth({
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      window.dispatchEvent(new Event('userLoggedIn'))
      const role = data.user.role
      if (role === 'admin') window.location.href = '/dashboard'
      else if (role === 'tenant') window.location.href = '/tenant-dashboard'
      else window.location.href = localStorage.getItem('lastVisitedPage') || '/'
    },
    onNeedsCompletion: () => {},
    onError: (msg) => setError(msg),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        window.dispatchEvent(new Event('userLoggedIn'))

        setTimeout(() => {
          switch (data.user.role) {
            case 'admin':
              window.location.href = '/dashboard'
              break
            case 'tenant':
              window.location.href = '/tenant-dashboard'
              break
            default:
              window.location.href = localStorage.getItem('lastVisitedPage') || '/'
          }
        }, 100)
      } else {
        setError(data.message || 'Username atau password salah')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      // Backend mungkin belum implement — tampilkan success UI apapun responsenya
      setForgotStep('sent')
    } catch {
      setForgotError('Gagal mengirim email. Coba lagi.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleGoogleLogin = () => googleSignIn()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-500 to-red-600 rounded-r-[80px] p-12 flex-col justify-center items-center text-white relative overflow-hidden"
      >
        <div className="max-w-md z-10">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Simplify management with our <span className="underline decoration-4">dashboard.</span>
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Simplify your e-commerce management with our user-friendly admin dashboard.
          </p>
          <div className="flex justify-center mt-12">
            <img
              src="https://img.freepik.com/free-vector/business-people-working-together-project_74855-6308.jpg"
              alt="Team"
              className="w-80 h-80 object-contain drop-shadow-2xl"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-3">
              <FiShield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">EkrafMarket</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                placeholder="Username atau Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

            <div className="text-right">
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setForgotStep('email'); setForgotEmail(''); setForgotError('') }}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all duration-300 shadow-lg"
            >
              {loading ? 'Masuk...' : 'Login'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or Login with</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Login with Google</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-red-600 hover:text-red-700 font-semibold">
                Signup
              </a>
            </p>
            <a href="/" className="block text-xs text-gray-400 hover:text-gray-600 mt-4">
              ← Back to Home
            </a>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {forgotStep === 'email' ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Masukkan email kamu. Kami akan kirimkan link untuk reset password.
                  </p>
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Email kamu"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                    {forgotError && (
                      <p className="text-red-600 text-sm">{forgotError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {forgotLoading ? 'Mengirim...' : 'Kirim Link'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMail className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Terkirim!</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Cek inbox <strong>{forgotEmail}</strong> dan klik link reset password yang kami kirimkan.
                  </p>
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    OK
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
