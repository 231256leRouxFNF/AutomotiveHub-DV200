import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Settings = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Settings</h1>
        <section className="section">
          <h2 className="section-title">Security</h2>
          <div className="section-content">Manage password, 2FA, and active sessions.</div>
        </section>
        <section className="section">
          <h2 className="section-title">Notifications</h2>
          <div className="section-content">Email, push, and marketing preferences.</div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
