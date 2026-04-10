import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_CONFIG from '../apiConfig';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, login, signup } = useAuth();
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
    paymentOption: '',
    addNote: false,
    orderNote: ''
  });

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const [isApplying, setIsApplying] = useState(false);

  const gateways = [
    { id: 'cod', title: 'Cash on Delivery', description: 'Pay with cash upon delivery.' },
    { id: 'bacs', title: 'Direct Bank Transfer', description: 'Make your payment directly into our bank account. Please use your Order ID as the payment reference.' },
    { id: 'paypal', title: 'PayPal', description: 'Pay via PayPal; you can pay with your credit card if you don’t have a PayPal account.' }
  ];

  useEffect(() => {
    if (formData.paymentOption === 'paypal' && !isScriptLoaded) {
      // Try to load settings from localStorage
      const savedSettings = localStorage.getItem('paypal_gateway_settings');
      let config = API_CONFIG.PAYPAL;

      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.paypalEnabled) {
            config = {
              MODE: parsed.mode,
              SANDBOX_CLIENT_ID: parsed.sandboxClientId,
              LIVE_CLIENT_ID: parsed.liveClientId,
              CURRENCY: parsed.currency || 'USD'
            };
          }
        } catch (e) {
          console.error("Failed to parse PayPal settings", e);
        }
      }

      const clientId = config.MODE === 'sandbox' ? config.SANDBOX_CLIENT_ID : config.LIVE_CLIENT_ID;
      if (clientId) {
        const script = document.createElement('script');
        // Disable credit and card funding sources and specify components
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${config.CURRENCY || 'USD'}&components=buttons&disable-funding=credit,card`;
        script.async = true;
        script.onload = () => {
          setIsScriptLoaded(true);
        };
        document.body.appendChild(script);
      }
    }
  }, [formData.paymentOption, isScriptLoaded]);

  useEffect(() => {
    if (isScriptLoaded && formData.paymentOption === 'paypal') {
      renderPayPalButtons();
    }
  }, [formData.paymentOption, isScriptLoaded]);

  const renderPayPalButtons = () => {
    if (window.paypal && document.getElementById('paypal-button-container')) {
      const container = document.getElementById('paypal-button-container');
      // Only render if the container is empty to avoid "Detected popup close" on re-renders
      if (container.children.length > 0) return;

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          const savedSettings = localStorage.getItem('paypal_gateway_settings');
          let currency = 'USD';
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            currency = parsed.currency || 'USD';
          }
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: currency,
                value: total.toFixed(2)
              }
            }]
          });
        },
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();
          console.log('PayPal Payment Success:', details);

          // Auto-fill email from PayPal if not already provided
          if (!formData.email && details.payer && details.payer.email_address) {
            setFormData(prev => ({ ...prev, email: details.payer.email_address }));
          }

          handleSubmit(null, 'paypal', details.id);
        },
        onCancel: () => {
          setError('Payment was cancelled. You can try again or choose another method.');
        },
        onError: (err) => {
          // Check for the "Detected popup close" error and handle it as a cancellation
          if (err && err.message && err.message.includes('Detected popup close')) {
            setError('PayPal window was closed. Please click the PayPal button again to retry.');
          } else {
            console.error('PayPal Error:', err);
            setError('PayPal is currently unavailable. Please try another payment method.');
          }
        }
      }).render('#paypal-button-container');
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAuthFormChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = isLoginTab 
        ? await login(authForm.email, authForm.password)
        : await signup(authForm.email, authForm.password, authForm.name);
        
      if (result.success) {
        setShowAuthModal(false);
      } else {
        setAuthError(result.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setAuthError('Authentication failed. Please check your connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = 0;
  const total = subtotal - discount + shipping;

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

        if (coupon.date_expires) {
          const expiryDate = new Date(coupon.date_expires);
          const now = new Date();
          if (expiryDate < now) {
            setDiscount(0);
            setCouponMessage({ text: 'This coupon has expired.', isError: true });
            return;
          }
        }

        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
          setDiscount(0);
          setCouponMessage({ text: 'This coupon usage limit has been reached.', isError: true });
          return;
        }

        let discountAmount = 0;
        if (coupon.discount_type === 'percent' || coupon.discount_type === 'percentage') {
          discountAmount = subtotal * (parseFloat(coupon.amount) / 100);
        } else if (coupon.discount_type === 'fixed_cart') {
          discountAmount = parseFloat(coupon.amount);
        } else {
          discountAmount = parseFloat(coupon.amount);
        }

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

  const handleSubmit = async (e, methodOverride = null, transactionId = null) => {
    if (e) e.preventDefault();

    // Prevent order placement if PayPal is selected but payment hasn't been captured via onApprove
    if (formData.paymentOption === 'paypal' && !methodOverride) {
      setError('Please use the PayPal button to complete your payment.');
      return;
    }

    // Check for authentication or guest email, but skip for PayPal if we already have a payment override
    if (!isAuthenticated && !formData.email && !methodOverride) {
      setShowAuthModal(true);
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const pmId = methodOverride || formData.paymentOption;
      const gatewaysList = gateways;

      const getCountryCode = (countryName) => {
        const codes = {
          'India': 'IN', 'United States': 'US', 'United Kingdom': 'GB', 'USA': 'US', 'UK': 'GB'
        };
        return codes[countryName] || countryName;
      };

      const getStateCode = (stateName) => {
        const codes = {
          'Punjab': 'PB', 'Delhi': 'DL', 'Maharashtra': 'MH', 'Karnataka': 'KA',
          'Tamil Nadu': 'TN', 'Gujarat': 'GJ', 'West Bengal': 'WB', 'Rajasthan': 'RJ',
          'Uttar Pradesh': 'UP', 'Telangana': 'TG', 'Haryana': 'HR', 'Bihar': 'BR'
        };
        return codes[stateName] || stateName;
      };

      // Safeguard for mandatory fields to avoid "Invalid parameter" error
      const safeVal = (val, fallback = 'N/A') => (val && val.trim() !== '') ? val : fallback;

      const billing = {
        first_name: (formData.useForBilling ? formData.firstName : formData.billingFirstName) || 'Guest',
        last_name: (formData.useForBilling ? formData.lastName : formData.billingLastName) || 'User',
        address_1: safeVal(formData.useForBilling ? formData.address : formData.billingAddress),
        city: safeVal(formData.useForBilling ? formData.city : formData.billingCity, 'City'),
        state: getStateCode(formData.useForBilling ? formData.state : formData.billingState) || 'PB',
        postcode: safeVal(formData.useForBilling ? formData.pinCode : formData.billingPinCode, '000000'),
        country: getCountryCode(formData.useForBilling ? formData.country : formData.billingCountry) || 'IN',
        email: formData.email || 'guest@example.com',
        phone: formData.phone || '0000000000'
      };

      const shipping = {
        first_name: formData.firstName || billing.first_name,
        last_name: formData.lastName || billing.last_name,
        address_1: safeVal(formData.address) || billing.address_1,
        city: safeVal(formData.city) || billing.city,
        state: getStateCode(formData.state) || billing.state,
        postcode: safeVal(formData.pinCode, '000000') || billing.postcode,
        country: getCountryCode(formData.country) || billing.country
      };

      const orderData = {
        payment_method: pmId,
        payment_method_title: gatewaysList.find(g => g.id === pmId)?.title || 'Payment',
        transaction_id: transactionId || '',
        billing: billing,
        shipping: shipping,
        line_items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        customer_note: formData.addNote ? formData.orderNote : '',
        status: pmId === 'paypal' ? 'processing' : 'pending'
      };

      const basicAuth = btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();

      if (response.ok) {
        setIsProcessing(false);
        clearCart();
        navigate(`/order-success/${responseData.id || responseData.number}`);
      } else {
        throw new Error(responseData.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred while processing your order.');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">Browse Products</button>
      </div>
    );
  }

  return (
    <>
      <div className="page-content container">
        <form onSubmit={handleSubmit} className="checkout-container">
          <div className="checkout-main">
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

            <section className="checkout-section">
              <h3>Shipping address</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Country/Region</label>
                  <select
                    required
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
                    required
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
                  <label>Phone</label>
                  <input
                    required
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

            {!formData.useForBilling && (
              <section className="checkout-section" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h3>Billing address</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Country/Region</label>
                    <select
                      required
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
                      required
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

            <section className="checkout-section">
              <h3>Payment options</h3>
              {gateways.length === 0 ? (
                <div style={{ padding: '1rem', color: '#ef4444' }}>No payment methods available. Please contact the store owner.</div>
              ) : (
                gateways.map(gw => (
                  <div key={gw.id}>
                    <div
                      className={`option-box ${formData.paymentOption === gw.id ? 'active' : ''}`}
                      onClick={() => setFormData(p => ({ ...p, paymentOption: gw.id }))}
                    >
                      <input type="radio" checked={formData.paymentOption === gw.id} readOnly />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{gw.title}</div>
                      </div>
                    </div>
                    {formData.paymentOption === gw.id && (
                      <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', marginTop: '-0.25rem', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                        <div
                          style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: gw.id === 'paypal' ? '1rem' : '0' }}
                          dangerouslySetInnerHTML={{ __html: gw.description }}
                        />
                        {gw.id === 'paypal' && (
                          <div id="paypal-button-container" style={{ marginTop: '1rem', minHeight: '150px' }}>
                            {!isScriptLoaded && <div style={{ textAlign: 'center', padding: '1rem' }}>Loading PayPal...</div>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

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

            {error && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2rem 0' }}>
              By proceeding with your purchase you agree to our <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms and Conditions</Link> and <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>
            </p>

            <div className="checkout-footer">
              <button type="button" className="btn-link" onClick={() => navigate('/cart')}>
                ← Return to Cart
              </button>
              {formData.paymentOption !== 'paypal' && (
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '1rem 3rem', borderRadius: '0.5rem' }}
                  disabled={isProcessing || !formData.paymentOption}
                >
                  {isProcessing ? 'Processing...' : (isAuthenticated ? 'Place Order' : 'Login to Place Order')}
                </button>
              )}
            </div>
          </div>

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
                      {item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 50) + '...' : 'Product description...'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</div>
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

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2 className="text-gradient">Secure Checkout</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Please login to proceed with your order
              </p>
            </div>

            <div className="auth-tabs">
              <div
                className={`auth-tab ${isLoginTab ? 'active' : ''}`}
                onClick={() => setIsLoginTab(true)}
              >
                Login
              </div>
              <div
                className={`auth-tab ${!isLoginTab ? 'active' : ''}`}
                onClick={() => setIsLoginTab(false)}
              >
                Sign Up
              </div>
            </div>

            <div className="auth-modal-body">
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {authError && <div className="auth-error">{authError}</div>}

                {!isLoginTab && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="John Doe"
                      value={authForm.name}
                      onChange={handleAuthFormChange}
                      required={!isLoginTab}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    required
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: '0.5rem', padding: '1rem' }}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Processing...' : (isLoginTab ? 'Sign In & Continue' : 'Create Account')}
                </button>

                {/* <button
                  type="button"
                  className="btn-link"
                  style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                  onClick={() => {
                    setShowAuthModal(false);
                    // If they have at least entered an email, we can proceed as guest
                    if (formData.email || authForm.email) {
                      const finalEmail = formData.email || authForm.email;
                      if (!formData.email) setFormData(prev => ({ ...prev, email: finalEmail }));
                      // Use setTimeout to ensure state updates before submission
                      setTimeout(() => handleSubmit(null), 100);
                    }
                  }}
                >
                  Continue as Guest
                </button> */}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
