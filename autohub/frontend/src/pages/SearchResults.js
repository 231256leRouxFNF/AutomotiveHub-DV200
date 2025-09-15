import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const SearchResults = () => {
  const [query] = useState('brake kit');
  const results = [
    'Brembo GT Brake Kit Front',
    'StopTech Street Performance Pads',
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Search</h1>
        <section className="section">
          <h2 className="section-title">Results for “{query}”</h2>
          <div className="section-content">
            <ul>
              {results.map((r,i)=>(<li key={i}>{r}</li>))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
