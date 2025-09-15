import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const MyListings = () => {
  const listings = [
    { id: 'L-1001', title: 'Forged Alloy Racing Wheels', status: 'Active' },
    { id: 'L-1002', title: 'Recaro Sportster CS Seats', status: 'Draft' },
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">My Listings</h1>
        <section className="section">
          <h2 className="section-title">Catalog</h2>
          <div className="section-content grid">
            {listings.map(l => (
              <div className="card" key={l.id}>
                <strong>{l.title}</strong>
                <div className="muted">{l.status}</div>
                <button className="btn-secondary" style={{marginTop:8}}>Edit</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyListings;
