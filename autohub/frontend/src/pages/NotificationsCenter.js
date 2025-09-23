import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import './PageLayout.css';

const NotificationsCenter = () => {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get('/api/notifications');
        if (!cancelled) setNotifs(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) setNotifs([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
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
