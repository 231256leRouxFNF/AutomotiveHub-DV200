import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Compare = () => {
  const specs = [
    { attr: 'Price', a: 'R 49,114.94', b: 'R 56,131.36' },
    { attr: 'Condition', a: 'New', b: 'Used - Good' },
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Compare</h1>
        <section className="section">
          <h2 className="section-title">Side-by-side</h2>
          <div className="section-content">
            <table style={{width:'100%'}}>
              <thead>
                <tr><th className="muted">Spec</th><th>Item A</th><th>Item B</th></tr>
              </thead>
              <tbody>
                {specs.map((s,i)=>(<tr key={i}><td className="muted">{s.attr}</td><td>{s.a}</td><td>{s.b}</td></tr>))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
