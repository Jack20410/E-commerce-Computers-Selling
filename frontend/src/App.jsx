import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminNavbar from './components/layout/AdminNavbar';

// Public pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import NotFoundPage from './pages/NotFoundPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProfilePage from './pages/ProfilePage';
import OAuth2Redirect from './pages/auth/OAuth2Redirect';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import OrdersPage from './pages/admin/OrdersPage';
import UsersPage from './pages/admin/UsersPage';
import OrderDetailAdmin from './pages/admin/OrderDetailAdmin';

const AdminLayout = () => {
  return (
    <div className="admin-layout flex flex-col min-h-screen w-full overflow-x-hidden">
      <AdminNavbar />
      <main className="admin-main flex-grow w-full bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
    <Navbar />
    <main className="flex-grow w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <ProfileProvider>
          <CartProvider>
            <Routes>
              {/* Admin Routes - using a separate route structure with empty path to avoid nesting issues */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/products" element={<ProductsAdmin />} />
                  <Route path="/admin/products/add" element={<AddProduct />} />
                  <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                  <Route path="/admin/orders" element={<OrdersPage />} />
                  <Route path="/admin/orders/:orderId" element={<OrderDetailAdmin />} />
                  <Route path="/admin/users" element={<UsersPage />} />
                </Route>
              </Route>

              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/category/:category" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/oauth2-redirect" element={<OAuth2Redirect />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
// 