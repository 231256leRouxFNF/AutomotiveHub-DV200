import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Orders = () => {
  const orders = [
    { id: 'AHT-1042', item: 'Brembo GT Brake Kit', status: 'Shipped' },
    { id: 'AHT-1043', item: 'BlackVue DR900X', status: 'Processing' },
  ];
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
                <button className="btn-primary" style={{marginTop:8}}>Track</button>
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
