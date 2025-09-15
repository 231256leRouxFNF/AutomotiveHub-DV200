import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const NotificationsCenter = () => {
  const notifs = [
    { id: 1, text: 'Your listing "Forged Alloy Racing Wheels" received a new offer.' },
    { id: 2, text: 'Order #AHT-1042 has shipped.' },
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Notifications</h1>
        <section className="section">
          <h2 className="section-title">Recent</h2>
          <div className="section-content">
            <ul>
              {notifs.map(n => (<li key={n.id}>{n.text}</li>))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsCenter;
