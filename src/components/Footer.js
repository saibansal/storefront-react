import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <h3 className="text-gradient" style={{ marginBottom: '1rem' }}>Aura Store</h3>
        <p style={{ color: 'var(--text-muted)' }}>Premium designs for everyone.</p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <p>&copy; {new Date().getFullYear()} Aura Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
