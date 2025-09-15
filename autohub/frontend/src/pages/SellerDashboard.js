import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const SellerDashboard = () => {
  const metrics = [
    { label: 'Revenue (30d)', value: 'R 124,560' },
    { label: 'Orders (30d)', value: '48' },
    { label: 'Conversion', value: '3.2%' },
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Seller Dashboard</h1>
        <section className="section">
          <h2 className="section-title">Performance</h2>
          <div className="section-content grid">
            {metrics.map((m, i) => (
              <div className="card" key={i}>
                <strong>{m.value}</strong>
                <div className="muted">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
