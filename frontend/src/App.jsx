import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Home} from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryList from './pages/CategoryList';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import TenantDetail from './pages/TenantDetail';
import StorePage from './pages/StorePage';
import StoresPage from './pages/StoresPage';
import UniversalLogin from './pages/UniversalLogin';
import UniversalRegister from './pages/UniversalRegister';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UserRegister from './pages/UserRegister';
import TenantRegister from './pages/TenantRegister';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { NotFound, BadRequest, Unauthorized, Forbidden, ServerError } from './pages/ErrorPages';
import { useLastVisited } from './hooks/useLastVisited';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

function AppContent() {
  useLastVisited();
  
  return (
    <Routes>
          <Route path="/" element={<Home />} />
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
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/tenant/:id" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <TenantDetail />
            </RoleProtectedRoute>
          } />
          <Route path="/store/:id" element={<StorePage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/tenant-dashboard" element={
            <RoleProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/user-register" element={<UserRegister />} />
          <Route path="/tenant-register" element={<TenantRegister />} />
          <Route path="/error/400" element={<BadRequest />} />
          <Route path="/error/401" element={<Unauthorized />} />
          <Route path="/error/403" element={<Forbidden />} />
          <Route path="/error/404" element={<NotFound />} />
          <Route path="/error/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
  )
}

export default App
