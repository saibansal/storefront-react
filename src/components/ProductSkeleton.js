import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="glass-panel skeleton-card">
      <div className="skeleton skeleton-img"></div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div className="skeleton skeleton-title"></div>
        </div>
        
        <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '90%', flex: 1 }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '1rem' }}>
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
