import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Privacy = () => (
  <div className="page-wrapper">
    <Header />
    <main className="page-container">
      <h1 className="page-title">Privacy Policy</h1>
      <section className="section">
        <h2 className="section-title">Data Use</h2>
        <div className="section-content">We collect account and transactional data to operate the marketplace. You can request export or deletion of your data from your account settings.</div>
      </section>
      <section className="section">
        <h2 className="section-title">Cookies</h2>
        <div className="section-content">We use essential cookies for authentication and analytics to improve product experience.</div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Privacy;
