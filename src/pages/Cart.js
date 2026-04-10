import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="page-content container" style={{ textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Your Cart is Empty</h2>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Shopping Cart</h1>
        
        <div className="cart-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.id}`}><h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.name}</h3></Link>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{item.price}</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '2rem' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>-</button>
                  <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>+</button>
                </div>
                
                <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', fontSize: '1.5rem', padding: '0.5rem' }}>×</button>
              </div>
            ))}
          </div>
          
          <div className="glass-panel" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
              <span>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', marginTop: '2rem' }}>Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
