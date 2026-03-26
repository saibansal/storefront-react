import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy login action
    alert('Logged in successfully!');
    navigate('/account');
  };

  return (
    <div className="page-content container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Login</h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} placeholder="Enter email" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} placeholder="Enter password" />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', fontSize: '1.1rem', padding: '1rem' }}>Sign In</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
          Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
