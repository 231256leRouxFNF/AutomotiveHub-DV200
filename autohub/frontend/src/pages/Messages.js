import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import './PageLayout.css';

const Messages = () => {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get('/api/messages');
        if (!cancelled) setThreads(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) setThreads([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
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
                <button className="btn-primary mt-8">Open</button>
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
