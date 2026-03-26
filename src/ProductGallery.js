import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // WooCommerce Public API Credentials
  const WP_URL = "https://your-site.com"; 
  const CK = "ck_xxxxxxxxxx"; // Your Consumer Key
  const CS = "cs_xxxxxxxxxx"; // Your Consumer Secret

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(`${WP_URL}/wp-json/wc/v3/products?consumer_key=${CK}&consumer_secret=${CS}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  if (loading) return <h2>Loading Store...</h2>;

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Our Shop</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '30px' 
      }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #eee', 
            borderRadius: '10px', 
            padding: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            {/* Display first image or placeholder */}
            <img 
              src={product.images[0]?.src || 'https://via.placeholder.com/200'} 
              alt={product.name} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px' }} 
            />
            <h3 style={{ margin: '15px 0 5px' }}>{product.name}</h3>
            <p style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '1.2rem' }}>
              ${product.regular_price}
            </p>
            <button style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;