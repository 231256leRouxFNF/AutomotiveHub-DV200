import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import './PageLayout.css';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get('/api/cart');
        if (!cancelled) {
          setItems(Array.isArray(res.data?.items) ? res.data.items : []);
          setTotal(typeof res.data?.total === 'number' ? res.data.total : 0);
        }
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Cart</h1>
        <section className="section">
          <h2 className="section-title">Items</h2>
          <div className="section-content">
            <ul>
              {items.map((i, idx) => (<li key={idx}>{i.title} — {i.price_cents ? `R ${(i.price_cents/100).toFixed(2)}` : i.price}</li>))}
            </ul>
            <div className="mt-12">Total: <strong>{`R ${(total/100).toFixed(2)}`}</strong></div>
            <button className="btn-primary mt-12">Checkout</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
