import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_CONFIG from '../apiConfig';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    country: 'India',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: 'Punjab',
    pinCode: '',
    phone: '',
    useForBilling: true,
    billingCountry: 'India',
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: 'Punjab',
    billingPinCode: '',
    shippingOption: 'free',
    paymentOption: 'cod',
    addNote: false,
    orderNote: ''
  });

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponInput.trim();
    if (!code) return;

    setIsApplying(true);
    setCouponMessage({ text: 'Validating coupon...', isError: false });

    try {
      const basicAuth = btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
      const encodedCode = encodeURIComponent(code.toLowerCase());
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/coupons?code=${encodedCode}`, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to validate coupon.');
      
      const coupons = await response.json();
      
      if (coupons && coupons.length > 0) {
        const coupon = coupons[0];
        const subtotal = getCartTotal();

        // 1. Expiry Check
        if (coupon.date_expires) {
          const expiryDate = new Date(coupon.date_expires);
          const now = new Date();
          if (expiryDate < now) {
            setDiscount(0);
            setCouponMessage({ text: 'This coupon has expired.', isError: true });
            return;
          }
        }

        // 2. Usage Limit Check
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
          setDiscount(0);
          setCouponMessage({ text: 'This coupon usage limit has been reached.', isError: true });
          return;
        }

        // 3. Discount Calculation
        let discountAmount = 0;
        if (coupon.discount_type === 'percent' || coupon.discount_type === 'percentage') {
          discountAmount = subtotal * (parseFloat(coupon.amount) / 100);
        } else if (coupon.discount_type === 'fixed_cart') {
          discountAmount = parseFloat(coupon.amount);
        } else {
          // Fallback
          discountAmount = parseFloat(coupon.amount);
        }

        // Prevent negative total
        if (discountAmount > subtotal) discountAmount = subtotal;

        setDiscount(discountAmount);
        setCouponMessage({ 
          text: `Coupon "${coupon.code.toUpperCase()}" applied! (Discount: ₹${discountAmount.toFixed(2)})`, 
          isError: false 
        });
      } else {
        setDiscount(0);
        setCouponMessage({ text: 'Invalid coupon code. Please check and try again.', isError: true });
      }
    } catch (err) {
      console.error('Coupon error:', err);
      setDiscount(0);
      setCouponMessage({ text: 'Could not verify coupon. Using offline mode.', isError: true });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponInput('');
    setCouponMessage({ text: 'Coupon removed.', isError: false });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    login({ email: authForm.email, name: authForm.name || authForm.email.split('@')[0] });
    setShowAuthModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    console.log('Order Data:', { ...formData, discount, total });
    alert('Order placed successfully! Thank you for your purchase.');
    clearCart();
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '5rem 0' }}>
         <h2 style={{ marginBottom: '1.5rem' }}>Your cart is empty</h2>
         <button onClick={() => navigate('/products')} className="btn-primary">Browse Products</button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = 0;
  const total = subtotal - discount + shipping;

  return (
    <div className="page-content container">
      <form onSubmit={handleSubmit} className="checkout-container">
        {/* Left Column: Form Fields */}
        <div className="checkout-main">
          {/* Contact Information */}
          <section className="checkout-section">
            <h3>Contact information</h3>
            <div className="form-group">
              <label>Email address</label>
              <input 
                required 
                type="email" 
                name="email"
                className="form-input" 
                placeholder="email@example.com" 
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* Shipping Address */}
          <section className="checkout-section">
            <h3>Shipping address</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Country/Region</label>
                <select 
                  name="country" 
                  className="form-select"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>First name</label>
                <input 
                  required 
                  type="text" 
                  name="firstName"
                  className="form-input" 
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Last name</label>
                <input 
                  required 
                  type="text" 
                  name="lastName"
                  className="form-input" 
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input 
                  required 
                  type="text" 
                  name="address"
                  className="form-input" 
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <button type="button" className="btn-link" style={{ gridColumn: 'span 2', justifyContent: 'flex-start', margin: '-0.5rem 0 1rem 0' }}>
                + Add apartment, suite, etc.
              </button>

              <div className="form-group">
                <label>City</label>
                <input 
                  required 
                  type="text" 
                  name="city"
                  className="form-input" 
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <select 
                  name="state" 
                  className="form-select"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div className="form-group">
                <label>PIN Code</label>
                <input 
                  required 
                  type="text" 
                  name="pinCode"
                  className="form-input" 
                  placeholder="PIN Code"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Phone (optional)</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="form-input" 
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <label className="checkbox-group">
              <input 
                type="checkbox" 
                name="useForBilling"
                checked={formData.useForBilling}
                onChange={handleInputChange}
              />
              Use same address for billing
            </label>
          </section>

          {/* Billing Address - Conditional Rendering */}
          {!formData.useForBilling && (
            <section className="checkout-section" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
              <h3>Billing address</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Country/Region</label>
                  <select 
                    name="billingCountry" 
                    className="form-select"
                    value={formData.billingCountry}
                    onChange={handleInputChange}
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>First name</label>
                  <input 
                    required 
                    type="text" 
                    name="billingFirstName"
                    className="form-input" 
                    placeholder="First name"
                    value={formData.billingFirstName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Last name</label>
                  <input 
                    required 
                    type="text" 
                    name="billingLastName"
                    className="form-input" 
                    placeholder="Last name"
                    value={formData.billingLastName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <input 
                    required 
                    type="text" 
                    name="billingAddress"
                    className="form-input" 
                    placeholder="Address"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input 
                    required 
                    type="text" 
                    name="billingCity"
                    className="form-input" 
                    placeholder="City"
                    value={formData.billingCity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <select 
                    name="billingState" 
                    className="form-select"
                    value={formData.billingState}
                    onChange={handleInputChange}
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input 
                    required 
                    type="text" 
                    name="billingPinCode"
                    className="form-input" 
                    placeholder="PIN Code"
                    value={formData.billingPinCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Shipping Options */}
          <section className="checkout-section">
            <h3>Shipping options</h3>
            <div 
              className={`option-box ${formData.shippingOption === 'free' ? 'active' : ''}`}
              onClick={() => setFormData(p => ({...p, shippingOption: 'free'}))}
            >
              <input type="radio" checked={formData.shippingOption === 'free'} readOnly />
              <div style={{ flex: 1 }}>
                <span>Free shipping</span>
              </div>
              <span style={{ fontWeight: 600 }}>FREE</span>
            </div>
          </section>

          {/* Payment Options */}
          <section className="checkout-section">
            <h3>Payment options</h3>
            <div 
              className={`option-box ${formData.paymentOption === 'cod' ? 'active' : ''}`}
              onClick={() => setFormData(p => ({...p, paymentOption: 'cod'}))}
            >
              <input type="radio" checked={formData.paymentOption === 'cod'} readOnly />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Cash on delivery</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pay with cash upon delivery.</div>
              </div>
            </div>

            <label className="checkbox-group" style={{ marginTop: '1.5rem' }}>
              <input 
                type="checkbox" 
                name="addNote"
                checked={formData.addNote}
                onChange={handleInputChange}
              />
              Add a note to your order
            </label>

            {formData.addNote && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Order notes (optional)</label>
                <textarea 
                  name="orderNote"
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  value={formData.orderNote}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            )}
          </section>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2rem 0' }}>
            By proceeding with your purchase you agree to our <a href="#" style={{ textDecoration: 'underline' }}>Terms and Conditions</a> and <a href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</a>
          </p>

          <div className="checkout-footer">
            <button type="button" className="btn-link" onClick={() => navigate('/cart')}>
              ← Return to Cart
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '0.5rem' }}>
              {isAuthenticated ? 'Place Order' : 'Login to Place Order'}
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="summary-sidebar glass-panel">
          <h3>Order summary</h3>
          
          <div className="checkout-product-list">
            {cartItems.map(item => (
              <div key={item.id} className="checkout-product-card">
                <div className="checkout-product-img-wrapper">
                  <img src={item.image} alt={item.name} className="checkout-product-img" />
                  <span className="product-badge">{item.quantity}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.description ? item.description.substring(0, 50) + '...' : 'Product description...'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                  {item.oldPrice && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{(item.oldPrice * item.quantity).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="add-coupons" onClick={() => setShowCoupon(!showCoupon)}>
            <span>Add coupons</span>
            <span style={{ transform: showCoupon ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
          </div>

          {showCoupon && (
            <div className="coupon-input-group">
              <input 
                type="text" 
                placeholder="Discount code" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={isApplying}
              />
              <button 
                type="button" 
                className="btn-primary" 
                style={{ height: 'auto', borderRadius: '0.5rem', padding: '0.5rem 1.5rem' }}
                onClick={handleApplyCoupon}
                disabled={isApplying}
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
          )}

          {couponMessage.text && (
            <div style={{ 
              fontSize: '0.85rem', 
              marginBottom: '1.5rem', 
              marginTop: '-1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: couponMessage.isError ? '#ef4444' : 'var(--primary)' 
            }}>
              <span>{couponMessage.text}</span>
              {discount > 0 && !isApplying && (
                <button 
                  type="button" 
                  onClick={handleRemoveCoupon}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#6b7280', 
                    textDecoration: 'underline', 
                    fontSize: '0.75rem', 
                    cursor: 'pointer',
                    padding: '0'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          )}

          <div className="summary-details">
            <div className="summary-item">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-item" style={{ color: 'var(--primary)' }}>
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-item">
              <span>Free shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-item total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
