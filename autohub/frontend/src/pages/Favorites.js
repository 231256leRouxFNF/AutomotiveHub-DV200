import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Favorites = () => {
  const saved = [
    'Forged Alloy Racing Wheels',
    'Carbon Fiber Rear Spoiler',
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Saved Items</h1>
        <section className="section">
          <h2 className="section-title">Favorites</h2>
          <div className="section-content">
            <ul>
              {saved.map((s, i) => (<li key={i}>{s}</li>))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
