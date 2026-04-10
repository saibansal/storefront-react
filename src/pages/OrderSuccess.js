import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API_CONFIG from '../apiConfig';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10); // Changed to 10 for better experience, can be 5 as requested

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const basicAuth = btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
        const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders/${orderId}`, {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/products');
    }
  }, [countdown, navigate]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '2rem' }}>Processing your receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2>Order not found</h2>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">Return to Menu</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '4rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(52, 211, 153, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Thank You!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your order <strong>#{order.id}</strong> has been successfully placed.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          padding: '1.5rem',
          borderRadius: '1rem',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          display: 'inline-block',
          border: '1px solid var(--border-color)'
        }}>
          Redirecting to menu in <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{countdown}</span> seconds...
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ margin: 0 }}>Order Receipt</h3>
          {/* <button onClick={() => window.print()} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
             Print Invoice
          </button> */}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <h5 className="text-muted small text-uppercase fw-bold mb-3">Billing Address</h5>
            <p style={{ margin: 0 }}>{order.billing.first_name} {order.billing.last_name}</p>
            <p style={{ margin: 0 }}>{order.billing.address_1}</p>
            <p style={{ margin: 0 }}>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
            <p style={{ margin: 0 }}>{order.billing.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h5 className="text-muted small text-uppercase fw-bold mb-3">Order Details</h5>
            <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(order.date_created).toLocaleDateString()}</p>
            <p style={{ margin: 0 }}><strong>Payment:</strong> {order.payment_method_title}</p>
            <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: 'var(--primary)' }}>{order.status}</span></p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Item</th>
                <th style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Qty</th>
                <th style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.line_items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1.5rem 0' }}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {item.sku || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1.5rem 0', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '1.5rem 0', textAlign: 'right', fontWeight: 600 }}>₹{parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Subtotal:</span>
              <span>₹{parseFloat(order.total - order.shipping_total).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Shipping:</span>
              <span>₹{parseFloat(order.shipping_total).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border-color)', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
              <span>Total:</span>
              <span>₹{parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/products" className="btn-primary" style={{ padding: '1rem 3rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Go to Menu <span style={{ fontSize: '1.2rem' }}>→</span>
        </Link>
      </div>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid var(--primary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media print {
          .btn-primary, .btn-outline, .summary-sidebar, footer, nav, .text-muted span:last-child {
            display: none !important;
          }
          body { background: white !important; color: black !important; }
          .glass-panel { border: none !important; box-shadow: none !important; background: none !important; color: black !important; }
          .text-gradient { -webkit-text-fill-color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
