import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Terms = () => (
  <div className="page-wrapper">
    <Header />
    <main className="page-container">
      <h1 className="page-title">Terms of Service</h1>
      <section className="section">
        <h2 className="section-title">Agreement</h2>
        <div className="section-content">Use of AutoHub constitutes acceptance of these terms. Listings must be accurate and lawful. Disputes are handled via our resolution center.</div>
      </section>
      <section className="section">
        <h2 className="section-title">Liability</h2>
        <div className="section-content">AutoHub provides the platform and payment facilitation; sellers are responsible for item compliance and fulfillment.</div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Terms;
