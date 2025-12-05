import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Home} from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryList from './pages/CategoryList';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import UniversalLogin from './pages/UniversalLogin';
import UniversalRegister from './pages/UniversalRegister';
import Test from './pages/Test';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UserRegister from './pages/UserRegister';
import TenantRegister from './pages/TenantRegister';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useLastVisited } from './hooks/useLastVisited';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
  useLastVisited();
  
  return (
    <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:category" element={<CategoryList />} />
          <Route path="/about-us" element={<AboutUs/>}/>
          <Route path="/contact-us" element={<ContactUs/>}/>
          <Route path="/login" element={<UniversalLogin />} />
          <Route path="/register" element={<UniversalRegister />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/tenant-dashboard" element={
            <ProtectedRoute>
              <TenantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-register" element={<UserRegister />} />
          <Route path="/tenant-register" element={<TenantRegister />} />
        </Routes>
  )
}

export default App
