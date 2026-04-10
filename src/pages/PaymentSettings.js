import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    paypalEnabled: true,
    mode: 'sandbox', // 'sandbox' or 'live'
    sandboxClientId: 'AZzExyhq-eICwsC6o76W0W9FkdITIKJ2oZBtaaKuZcocKE6TtZz4MrXLDmsQgioMoeXtvcfuvrKF2GYo',
    liveClientId: '',
    currency: 'USD'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('paypal_gateway_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('paypal_gateway_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-content container" style={{ maxWidth: '800px', marginTop: '4rem' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Payment Gateway Settings</h1>

        {saved && (
          <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            Settings saved successfully! You can now test the checkout with your credentials.
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'grid', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Enable PayPal Gateway</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Show PayPal as a payment option at checkout</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.paypalEnabled}
                  onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold' }}>Environment Mode</label>
              <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.8rem', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    checked={settings.mode === 'sandbox'}
                    onChange={() => setSettings({ ...settings, mode: 'sandbox' })}
                  />
                  <span>Sandbox (Testing)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    checked={settings.mode === 'live'}
                    onChange={() => setSettings({ ...settings, mode: 'live' })}
                  />
                  <span style={{ color: 'var(--accent)' }}>Live (Production)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {settings.mode === 'sandbox' ? 'Sandbox Client ID' : 'Live Client ID'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter Client ID"
                  value={settings.mode === 'sandbox' ? settings.sandboxClientId : settings.liveClientId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (settings.mode === 'sandbox') setSettings({ ...settings, sandboxClientId: val });
                    else setSettings({ ...settings, liveClientId: val });
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Currency</label>
                <select
                  className="form-input"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Settings</button>
            <Link to="/checkout" className="btn-outline" style={{ flex: 1, textAlign: 'center' }}>Return to Checkout</Link>
          </div>
        </form>

        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <h4 style={{ color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Developer Note:</h4>
          <p>These settings are stored locally in your browser for demonstration purposes. In a production environment, these would be managed securely in the backend.</p>
        </div>
      </div>

      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255,255,255,0.1);
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 4px; bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(24px); }
        
        .form-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: 0.8rem;
          color: white;
          font-size: 1rem;
        }
        .form-input:focus { outline: none; border-color: var(--primary); background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default PaymentSettings;
