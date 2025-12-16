import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShield } from 'react-icons/fi'

export default function UniversalLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Attempting login with:', credentials.username)

    try {
      const response = await fetch('http://localhost:5006/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        window.dispatchEvent(new Event('userLoggedIn'))
        
        console.log('Login successful, user role:', data.user.role)
        
        // Redirect based on role with delay
        setTimeout(() => {
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
        }, 100)
      } else {
        setError(data.message || 'Username atau password salah')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Orange */}
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
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
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
              <a href="#" className="text-sm text-gray-500 hover:text-red-600">
                Forgot password?
              </a>
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" />
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="https://www.facebook.com/favicon.ico" className="w-5 h-5 mr-2" alt="Facebook" />
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-red-600 hover:text-red-700 font-semibold">
                Signup
              </a>
            </p>
            
            <div className="flex justify-center gap-3 text-xs">
              <a href="/user-register" className="text-blue-500 hover:text-blue-600 font-medium">
                Register as User
              </a>
              <span className="text-gray-300">|</span>
              <a href="/tenant-register" className="text-red-600 hover:text-red-700 font-medium">
                Register as Tenant
              </a>
            </div>
            
            <a href="/" className="block text-xs text-gray-400 hover:text-gray-600 mt-4">
              ← Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}