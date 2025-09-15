import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const HelpCenter = () => {
  const faqs = [
    { q: 'How do I create a listing?', a: 'Navigate to Sell > Create Listing and complete the steps.' },
    { q: 'How are payments handled?', a: 'Payments are processed securely and released after delivery confirmation.' },
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Help Center</h1>
        <section className="section">
          <h2 className="section-title">FAQs</h2>
          <div className="section-content">
            {faqs.map((f, i) => (
              <div key={i} style={{marginBottom:12}}>
                <strong>{f.q}</strong>
                <div className="muted">{f.a}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="section">
          <h2 className="section-title">Open a Ticket</h2>
          <div className="section-content">Contact support with order IDs and evidence for faster resolution.</div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
