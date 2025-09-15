import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const AdminDashboard = () => {
  const panels = [
    'Users', 'Listings', 'Reports', 'Content', 'Taxonomies', 'Settings'
  ];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Admin Dashboard</h1>
        <section className="section">
          <h2 className="section-title">Management</h2>
          <div className="section-content grid">
            {panels.map((p,i)=>(<div className="card" key={i}><strong>{p}</strong><div className="muted">Open module</div></div>))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
