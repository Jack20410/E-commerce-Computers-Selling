import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';

// import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
              <Navbar />
              <main className="flex-grow w-full">
                <Routes>
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
                  {/* Admin Routes */}
                  <Route path="/admin/add-product" element={<AddProduct />} />
                  <Route path="/admin/edit-product/:id" element={<EditProduct />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
