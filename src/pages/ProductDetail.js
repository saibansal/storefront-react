import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_CONFIG from '../apiConfig';
import DetailSkeleton from '../components/DetailSkeleton';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_CONFIG.BASE_URL}wc/store/v1/products?slug=${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found or failed to fetch');
        return res.json();
      })
      .then(data => {
        if (!data || data.length === 0) throw new Error('Product not found');
        const p = data[0]; // The slug search returns an array
        const minorUnit = p.prices?.currency_minor_unit !== undefined ? p.prices.currency_minor_unit : 2;
        const rawPrice = Number(p.prices?.price) || 0;
        const rawRegularPrice = Number(p.prices?.regular_price) || 0;
        const rawSalePrice = Number(p.prices?.sale_price) || 0;
        setProduct({
          id: p.id,
          name: p.name,
          price: Number((rawPrice / (10 ** minorUnit)).toFixed(2)),
          regularPrice: Number((rawRegularPrice / (10 ** minorUnit)).toFixed(2)),
          salePrice: Number((rawSalePrice / (10 ** minorUnit)).toFixed(2)),
          onSale: p.on_sale,
          image: p.images && p.images.length > 0 ? p.images[0].src : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE3CETL_OertJKScoHfblxs6CBrKGVCmVESw&s',
          imageAlt: p.images && p.images.length > 0 ? p.images[0].alt : p.name,
          images: p.images || [],
          shortDescription: p.short_description ? p.short_description.replace(/<[^>]+>/g, '') : '',
          description: p.description ? p.description.replace(/<[^>]+>/g, '') : 'No description available.',
          categories: p.categories || [],
          tags: p.tags || [],
          sku: p.sku || 'N/A',
          is_in_stock: p.is_in_stock,
          stock_quantity: p.stock_quantity,
          averageRating: p.average_rating,
          reviewCount: p.review_count,
          attributes: p.attributes || [],
          add_to_cart: p.add_to_cart,
          raw: p
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="page-content container">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-content container" style={{ textAlign: 'center' }}>
        <h2>{error || 'Product not found'}</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', gridAutoFlow: 'row dense' }}>
        {/* Left Column - Image Gallery */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
          {product.onSale && (
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'var(--accent)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', zIndex: 10 }}>
              SALE
            </div>
          )}
          {!product.is_in_stock && (
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#ef4444', color: '#fff', padding: '0.4rem 1rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 'bold', zIndex: 10 }}>
              OUT OF STOCK
            </div>
          )}
          <img src={product.image} alt={product.imageAlt} style={{ width: '100%', height: 'auto', borderRadius: '1rem', display: 'block' }} />
          
          {/* Thumbnails if multiple images exist */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {product.images.slice(1).map((img, index) => (
                <img key={index} src={img.thumbnail || img.src} alt={img.alt || product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border-color)', cursor: 'pointer' }} />
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column - Details */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {product.categories.map(c => (
              <span key={c.id} style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                {c.name}
              </span>
            ))}
          </div>

          <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            {Number(product.averageRating) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>{'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({product.reviewCount} reviews)</span>
              </div>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SKU: {product.sku || 'N/A'}</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            {product.onSale ? (
              <>
                <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1.5rem' }}>${product.regularPrice.toFixed(2)}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '2.5rem' }}>${product.salePrice.toFixed(2)}</span>
              </>
            ) : (
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '2.5rem' }}>${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            {product.shortDescription && (
               <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.8' }}>
                 {product.shortDescription}
               </p>
            )}
          </div>
          
          {/* Attributes / Variants Preview */}
          {product.attributes.length > 0 && (
            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Specifications</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {product.attributes.map(attr => (
                  <li key={attr.id || attr.name} style={{ display: 'flex', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    <span style={{ width: '120px', color: 'var(--text-muted)' }}>{attr.name}</span>
                    <span style={{ flex: 1, fontWeight: '500' }}>{attr.terms ? attr.terms.map(t => t.name).join(', ') : 'N/A'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <button 
              onClick={() => addToCart(product)} 
              className="btn-primary" 
              style={{ flex: 2, fontSize: '1.1rem', padding: '1rem', opacity: product.is_in_stock ? 1 : 0.5, cursor: product.is_in_stock ? 'pointer' : 'not-allowed' }}
              disabled={!product.is_in_stock}
            >
              {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <Link to="/cart" className="btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              View Cart
            </Link>
          </div>
          
          {product.stock_quantity !== null && typeof product.stock_quantity !== 'undefined' && (
            <p style={{ marginTop: '1rem', color: product.stock_quantity < 5 ? '#ef4444' : 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
              {product.stock_quantity} items left in stock
            </p>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '0.5rem' }}>Tags:</span>
              {product.tags.map(t => (
                <span key={t.id} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '2rem' }}>
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Full Description Section below */}
      {product.description && product.description !== product.shortDescription && (
        <div className="container" style={{ marginTop: '3rem' }}>
          <div className="glass-panel" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Product Information</h2>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              {product.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
