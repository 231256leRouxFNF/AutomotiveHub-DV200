import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { listingService } from '../services/api'; // or productService if you have one

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="muted">Loading product…</div>;
  if (error) return <div className="muted" style={{ color: 'red' }}>{error}</div>;
  if (!product) return <div className="muted">Product not found</div>;

  return (
    <div>
      <Header />
      <main className="product-page">
        <Link to="/marketplace">← Back to marketplace</Link>
        <h1>{product.title || product.make + ' ' + product.model}</h1>
        {product.image_url && <img src={product.image_url} alt={product.title} style={{maxWidth: '100%'}} />}
        <p>{product.description}</p>
        <div>Price: {product.price}</div>
        <div>Year: {product.year}</div>
        {/* etc */}
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;