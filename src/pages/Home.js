import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_CONFIG from '../apiConfig';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_CONFIG.BASE_URL}wc/store/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedProducts = data.slice(0, 3).map(p => {
            const minorUnit = p.prices?.currency_minor_unit !== undefined ? p.prices.currency_minor_unit : 2;
            const rawPrice = Number(p.prices?.price) || 0;
            const rawRegularPrice = Number(p.prices?.regular_price) || 0;
            const rawSalePrice = Number(p.prices?.sale_price) || 0;
            return {
               id: p.id,
               name: p.name,
               price: Number((rawPrice / (10 ** minorUnit)).toFixed(2)),
               regularPrice: Number((rawRegularPrice / (10 ** minorUnit)).toFixed(2)),
               salePrice: Number((rawSalePrice / (10 ** minorUnit)).toFixed(2)),
               onSale: p.on_sale,
               image: p.images && p.images.length > 0 ? p.images[0].src : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE3CETL_OertJKScoHfblxs6CBrKGVCmVESw&s',
               categories: p.categories || [],
               averageRating: p.average_rating,
               is_in_stock: p.is_in_stock,
               slug: p.slug
            };
          });
          setFeaturedProducts(formattedProducts);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products for home page', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-content">
      <div className="container">
        {/* Navigation Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(0, 0, 0, 0.9))',
          borderRadius: '1.5rem',
          padding: '5rem 3rem',
          textAlign: 'center',
          marginBottom: '4rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Aura Navigation Banner</h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.8' }}>
              Your premium destination for the best tech and lifestyle accessories. Explore our exclusive collections today.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Shop All Products</Link>
              <Link to="/about" className="btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.05)' }}>Discover Our Story</Link>
            </div>
          </div>
          
          {/* Decorative background elements code */}
          <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', background: '#3b82f6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }}></div>
        </div>

        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Featured Products</h2>
          {loading ? (
             <p className="text-gradient" style={{ textAlign: 'center', padding: '2rem' }}>Loading featured products...</p>
          ) : (
             <div className="products-grid">
               {featuredProducts.map(product => (
                 <div key={product.id} className="glass-panel product-card" style={{ padding: '0', position: 'relative' }}>
                   {product.onSale && (
                     <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--accent)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>
                       SALE
                     </div>
                   )}
                   <img src={product.image} alt={product.name} className="product-img" style={{ borderRadius: '1rem 1rem 0 0', margin: 0, height: '200px' }} />
                   <div style={{ padding: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                       <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
                       {Number(product.averageRating) > 0 && <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>★ {product.averageRating}</span>}
                     </div>
                     <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                       {product.categories.map(c => c.name).join(', ')}
                     </p>
                     
                     <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                       {product.onSale ? (
                         <>
                           <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1rem' }}>${product.regularPrice.toFixed(2)}</span>
                           <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.salePrice.toFixed(2)}</span>
                         </>
                       ) : (
                         <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.price.toFixed(2)}</span>
                       )}
                     </div>

                     <Link to={`/product/${product.slug}`} className="btn-outline" style={{ display: 'block', textAlign: 'center' }}>View Details</Link>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
