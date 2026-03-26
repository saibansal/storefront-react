import React from 'react';

const Account = () => {
  return (
    <div className="page-content container">
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My Account</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Profile Details</h3>
            <p style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> John Doe</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> john@example.com</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Member Since:</strong> March 2026</p>
            <button className="btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Edit Profile</button>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Recent Orders</h3>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <p><strong>Order #1024</strong> <span style={{ float: 'right', color: 'var(--text-muted)' }}>Delivered</span></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aura Plus Watch</p>
            </div>
            <div>
              <p><strong>Order #1011</strong> <span style={{ float: 'right', color: 'var(--text-muted)' }}>Delivered</span></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Smart Mirror v2</p>
            </div>
            <button className="btn-outline" style={{ marginTop: '2rem', width: '100%' }}>View All Orders</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
