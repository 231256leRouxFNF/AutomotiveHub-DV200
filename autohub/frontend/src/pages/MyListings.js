import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import './PageLayout.css';

const MyListings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get('/api/my/listings');
        if (!cancelled) setListings(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) setListings([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
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
                <button className="btn-secondary mt-8">Edit</button>
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
