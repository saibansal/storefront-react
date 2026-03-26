import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartCount } = useCart();

  return (
    <header className="main-header">
      <div className="top-banner">
        <p>✨ Free Premium Shipping on All Orders Over $200! ✨ <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '10px' }}>Shop Now</Link></p>
      </div>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-brand">Aura Store</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
          <div className="nav-links">
            <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
              🛒 Cart
              {getCartCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-15px',
                  background: 'var(--primary)',
                  color: '#1e293b',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {getCartCount()}
                </span>
              )}
            </Link>
            <Link to="/account" className="nav-link">Account</Link>
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;