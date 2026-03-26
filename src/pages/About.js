import React from 'react';

const About = () => {
  return (
    <div className="page-content container">
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>About Aura Store</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          At Aura Store, we curate premium lifestyle products that elevate your everyday experience. Our selection focuses on minimalist design, outstanding quality, and sustainable practices.
        </p>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.8' }}>
          Founded in 2026, we believe that objects should not only be functional but beautiful. We source our products globally, ensuring every item meets our high standards before making its way to your home.
        </p>
      </div>
    </div>
  );
};

export default About;
