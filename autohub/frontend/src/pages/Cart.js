import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Cart = () => {
  const items = [
    { title: 'Ohlins Road & Track Coilovers', price: 'R 36,836.21' },
  ];
  const total = 'R 36,836.21';
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Cart</h1>
        <section className="section">
          <h2 className="section-title">Items</h2>
          <div className="section-content">
            <ul>
              {items.map((i, idx) => (<li key={idx}>{i.title} — {i.price}</li>))}
            </ul>
            <div style={{marginTop:12}}>Total: <strong>{total}</strong></div>
            <button className="btn-primary" style={{marginTop:12}}>Checkout</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
