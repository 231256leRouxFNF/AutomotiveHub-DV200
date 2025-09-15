import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const Messages = () => {
  const threads = [
    { id: 1, title: 'Inquiry about Brembo GT Brake Kit', unread: 2 },
    { id: 2, title: 'Offer for Recaro Seats', unread: 0 },
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Messages</h1>
        <section className="section">
          <h2 className="section-title">Conversations</h2>
          <div className="section-content grid">
            {threads.map(t => (
              <div className="card" key={t.id}>
                <strong>{t.title}</strong>
                <div className="muted">{t.unread > 0 ? `${t.unread} new` : 'Up to date'}</div>
                <button className="btn-primary" style={{marginTop:8}}>Open</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
