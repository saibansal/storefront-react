import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_CONFIG from '../apiConfig';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [subTab, setSubTab] = useState('dashboard');

  // Account Details States
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: ''
  });
  const [updateMessage, setUpdateMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    if (user) {
      setEditedUser({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        displayName: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsFetching(true);
      try {
        const basicAuth = btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
        // IMPORTANT: WooCommerce API uses 'customer' parameter for ID, 'email' is not a standard filter
        const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders?customer=${user.id}`, {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ text: '', isError: false });

    try {
      const token = localStorage.getItem('aura_jwt_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}wp/v2/users/me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: editedUser.firstName,
          last_name: editedUser.lastName,
          name: editedUser.displayName,
          nickname: editedUser.displayName,
          display_name: editedUser.displayName,
          email: editedUser.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = {
          ...user,
          name: data.name,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name
        };
        localStorage.setItem('aura_user_info', JSON.stringify(newUser));
        setUpdateMessage({ text: 'Account details changed successfully.', isError: false });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update details');
      }
    } catch (err) {
      setUpdateMessage({ text: err.message, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'details', label: 'Account details' },
    { id: 'logout', label: 'Log out', action: logout }
  ];

  if (!user) return null;

  return (
    <div className="page-content container" style={{ padding: '4rem 0' }}>
      <div className="account-layout" style={{ display: 'flex', gap: '4rem', marginTop: '4rem' }}>

        {/* Sidebar Navigation */}
        <aside className="account-sidebar" style={{ width: '220px', flexShrink: 0 }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>My account</h1>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => item.action ? item.action() : setSubTab(item.id)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: '1.1rem', cursor: 'pointer',
                    color: subTab === item.id ? '#fff' : '#666',
                    fontWeight: subTab === item.id ? '600' : '400',
                    textDecoration: subTab === item.id ? 'underline' : 'none',
                    textUnderlineOffset: '8px'
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="account-main" style={{ flex: 1 }}>
          {subTab === 'dashboard' && (
            <div className="dashboard-view" style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.5)', lineHeight: '1.6' }}>
              <p className="mb-4">
                Hello <strong>{user.name || user.nicename}</strong> (not <strong>{user.name || user.nicename}</strong>? <span onClick={logout} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255,255,255,.8)' }}>Log out</span>)
              </p>
              <p>
                From your account dashboard you can view your <span onClick={() => setSubTab('orders')} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255,255,255,.8)' }}>recent orders</span>,
                manage your <span onClick={() => setSubTab('addresses')} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255,255,255,.8)' }}>shipping and billing addresses</span>,
                and <span onClick={() => setSubTab('details')} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255,255,255,.8)' }}>edit your password and account details</span>.
              </p>
            </div>
          )}

          {subTab === 'orders' && (
            <div className="orders-view">
              <h3 style={{ marginBottom: '2rem' }}>Recent Orders</h3>
              {isFetching ? <p>Loading orders...</p> : (
                orders.length > 0 ? (
                  <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                          <th style={{ padding: '1.2rem' }}>Order</th>
                          <th style={{ padding: '1.2rem' }}>Email</th>
                          <th style={{ padding: '1.2rem' }}>Date</th>
                          <th style={{ padding: '1.2rem' }}>Status</th>
                          <th style={{ padding: '1.2rem' }}>Total</th>
                          <th style={{ padding: '1.2rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>#{order.id}</td>
                            <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>{order.billing?.email}</td>
                            <td style={{ padding: '1.2rem' }}>{new Date(order.date_created).toLocaleDateString()}</td>
                            <td style={{ padding: '1.2rem' }}>
                              <span style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '1rem',
                                fontSize: '0.8rem',
                                background: order.status === 'completed' ? '#059669' : (order.status === 'cancelled' ? '#dc2626' : 'var(--primary)'),
                                color: 'white',
                                textTransform: 'capitalize'
                              }}>
                                {order.status}
                              </span>
                            </td>
                            <td style={{ padding: '1.2rem' }}>₹{order.total} <small className="text-muted">({order.line_items.length} items)</small></td>
                            <td style={{ padding: '1.2rem', display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => navigate(`/order-success/${order.id}`)}
                                className="btn-outline"
                                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                              >
                                View
                              </button>
                              {['pending', 'processing'].includes(order.status) && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to cancel this order?')) {
                                      const basicAuth = btoa(`${API_CONFIG.CONSUMER_KEY}:${API_CONFIG.CONSUMER_SECRET}`);
                                      const response = await fetch(`${API_CONFIG.BASE_URL}wc/v3/orders/${order.id}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Authorization': `Basic ${basicAuth}`,
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ status: 'cancelled' })
                                      });
                                      if (response.ok) {
                                        // Refresh orders
                                        window.location.reload();
                                      }
                                    }
                                  }}
                                  className="btn-outline"
                                  style={{ padding: '5px 12px', fontSize: '0.8rem', color: '#f87171', borderColor: '#f87171' }}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p>No orders yet. <Link to="/products" style={{ color: 'var(--primary)' }}>Start shopping!</Link></p>
              )}
            </div>
          )}

          {subTab === 'details' && (
            <div className="details-view">
              <form onSubmit={handleUpdateAccount} style={{ maxWidth: '800px' }}>
                {updateMessage.text && (
                  <div style={{ padding: '1rem', background: updateMessage.isError ? '#fee2e2' : '#f0fdf4', color: updateMessage.isError ? '#b91c1c' : '#166534', marginBottom: '2rem' }}>
                    {updateMessage.text}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>First name *</label>
                    <input type="text" className="form-input" style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} value={editedUser.firstName} onChange={e => setEditedUser({ ...editedUser, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Last name *</label>
                    <input type="text" className="form-input" style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} value={editedUser.lastName} onChange={e => setEditedUser({ ...editedUser, lastName: e.target.value })} required />
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Display name *</label>
                  <input type="text" className="form-input" style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} value={editedUser.displayName} onChange={e => setEditedUser({ ...editedUser, displayName: e.target.value })} required />
                  <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', marginTop: '0.5rem' }}>
                    This will be how your name will be displayed in the account section and in reviews
                  </p>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email address *</label>
                  <input type="email" className="form-input" style={{ background: 'white', color: 'black', border: '1px solid #ccc' }} value={editedUser.email} onChange={e => setEditedUser({ ...editedUser, email: e.target.value })} required />
                </div>

                <button type="submit" className="btn-primary" disabled={isUpdating} style={{ color: 'white', padding: '1.2rem 2.5rem', border: 'none' }}>
                  {isUpdating ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>
          )}

          {['downloads', 'addresses'].includes(subTab) && (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#666' }}>
              <h2 style={{ textTransform: 'capitalize' }}>{subTab}</h2>
              <p>No {subTab} available yet.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Account;
