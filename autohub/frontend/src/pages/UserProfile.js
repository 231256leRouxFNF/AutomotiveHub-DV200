import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const UserProfile = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Profile</h1>
        <section className="section">
          <h2 className="section-title">Account Information</h2>
          <div className="section-content grid">
            <div className="card">
              <strong>Name</strong>
              <div className="muted">Update display name and username</div>
            </div>
            <div className="card">
              <strong>Contact</strong>
              <div className="muted">Email, phone, and address</div>
            </div>
            <div className="card">
              <strong>Preferences</strong>
              <div className="muted">Language, currency, and region</div>
            </div>
          </div>
        </section>
        <section className="section">
          <h2 className="section-title">Garage</h2>
          <div className="section-content">Manage vehicles linked to your profile.</div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
