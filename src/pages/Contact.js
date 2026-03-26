import React, { useState } from 'react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-content container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Contact Us</h1>
        
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Thank you for reaching out!</h3>
            <p style={{ color: 'var(--text-muted)' }}>We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Your Name</label>
              <input required type="text" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
              <input required type="email" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} placeholder="john@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Message</label>
              <textarea required rows="5" style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', fontSize: '1.1rem', padding: '1rem' }}>Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
