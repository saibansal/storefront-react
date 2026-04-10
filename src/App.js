import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './pages/Login';
import OrderSuccess from './pages/OrderSuccess';
import './index.css';
import './layout.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-5 text-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router basename="/estore/frontend/">
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              
              <Route path="/login" element={<Login />} />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
