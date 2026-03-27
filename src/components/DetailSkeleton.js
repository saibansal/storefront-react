import React from 'react';

const DetailSkeleton = () => {
  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="skeleton" style={{ width: '100%', height: '500px', borderRadius: '1rem' }}></div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '0.5rem' }}></div>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '0.5rem' }}></div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div className="skeleton skeleton-text" style={{ width: '30%', height: '1.5rem', marginBottom: '1rem' }}></div>
        <div className="skeleton skeleton-title" style={{ width: '90%', height: '3.5rem', marginBottom: '2rem' }}></div>
        <div className="skeleton skeleton-price" style={{ width: '50%', height: '3rem', marginBottom: '2.5rem' }}></div>
        <div className="skeleton skeleton-text" style={{ marginBottom: '1rem' }}></div>
        <div className="skeleton skeleton-text" style={{ marginBottom: '1rem' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '2.5rem' }}></div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="skeleton" style={{ flex: 2, height: '3.5rem', borderRadius: '9999px' }}></div>
          <div className="skeleton" style={{ flex: 1, height: '3.5rem', borderRadius: '9999px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;
