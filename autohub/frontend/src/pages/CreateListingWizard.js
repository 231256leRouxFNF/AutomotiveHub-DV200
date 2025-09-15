import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const CreateListingWizard = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Create Listing</h1>
        <section className="section">
          <h2 className="section-title">Steps</h2>
          <div className="section-content grid">
            <div className="card"><strong>1. Details</strong><div className="muted">Title, category, condition</div></div>
            <div className="card"><strong>2. Media</strong><div className="muted">Photos and videos</div></div>
            <div className="card"><strong>3. Pricing</strong><div className="muted">Price, currency, shipping</div></div>
            <div className="card"><strong>4. Publish</strong><div className="muted">Preview and submit</div></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CreateListingWizard;
