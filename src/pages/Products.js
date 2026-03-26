import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_CONFIG from '../apiConfig';

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_CONFIG.BASE_URL}wc/store/products`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        const formattedProducts = data.map(p => {
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
            description: p.short_description ? p.short_description.replace(/<[^>]+>/g, '') : p.description?.replace(/<[^>]+>/g, '') || 'No description available.',
            categories: p.categories || [],
            averageRating: p.average_rating,
            is_in_stock: p.is_in_stock,
            slug: p.slug,
            raw: p
          };
        });
        setProducts(formattedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 className="text-gradient">Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Our Products</h1>
        
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="glass-panel product-card" style={{ padding: '0', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {product.onSale && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--accent)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>
                  SALE
                </div>
              )}
              {!product.is_in_stock && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>
                  OUT OF STOCK
                </div>
              )}
              <Link to={`/product/${product.slug}`}>
                <img src={product.image} alt={product.name} className="product-img" style={{ borderRadius: '1rem 1rem 0 0', margin: 0, height: '250px', objectFit: 'cover' }} />
              </Link>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <Link to={`/product/${product.slug}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
                  </Link>
                  {Number(product.averageRating) > 0 && <span style={{ color: '#fbbf24', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>★ {product.averageRating}</span>}
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {product.categories.map(c => c.name).join(', ')}
                </p>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1, lineHeight: '1.5' }}>
                  {product.description.length > 70 ? product.description.substring(0, 70) + '...' : product.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {product.onSale ? (
                      <>
                        <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.9rem' }}>${product.regularPrice.toFixed(2)}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.salePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => addToCart(product)} 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', opacity: product.is_in_stock ? 1 : 0.5, cursor: product.is_in_stock ? 'pointer' : 'not-allowed' }}
                    disabled={!product.is_in_stock}
                  >
                    {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
