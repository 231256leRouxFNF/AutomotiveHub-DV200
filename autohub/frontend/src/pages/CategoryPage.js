import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const items = ['Item 1','Item 2','Item 3'];
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Category: {slug}</h1>
        <section className="section">
          <h2 className="section-title">Browse</h2>
          <div className="section-content grid">
            {items.map((i,idx)=>(<div className="card" key={idx}>{i}</div>))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
