import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import './PageLayout.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get('/api/orders');
        if (!cancelled) setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) setOrders([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Orders</h1>
        <section className="section">
          <h2 className="section-title">Order History</h2>
          <div className="section-content grid">
            {orders.map(o => (
              <div className="card" key={o.id}>
                <strong>{o.id}</strong>
                <div className="muted">{o.item} • {o.status}</div>
                <button className="btn-primary mt-8">Track</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
