import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { listingService, authService } from '../services/api';
import './PageLayout.css';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!currentUser || !currentUser.id) {
          console.warn('User not authenticated for MyListings.');
          setListings([]);
          // Optionally redirect to login
          // navigate('/login');
          return;
        }
        const res = await listingService.getListingsByUserId(currentUser.id);
        if (!cancelled) setListings(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!cancelled) {
          console.error('Error fetching my listings:', e);
          setListings([]);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingService.deleteListing(listingId);
        setListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
        alert('Listing deleted successfully!');
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing.');
      }
    }
  };

  const handleEditListing = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">My Listings</h1>
        <section className="section">
          <h2 className="section-title">Catalog</h2>
          <div className="section-content grid">
            {listings.length > 0 ? ( 
              listings.map(l => (
                <div className="card" key={l.id}>
                  <strong>{l.title}</strong>
                  <div className="muted">Status: {l.status}</div>
                  <button className="btn primary-btn mt-8" onClick={() => handleEditListing(l.id)}>Edit</button>
                  <button className="btn secondary-btn mt-8" onClick={() => handleDeleteListing(l.id)}>Delete</button>
                </div>
              ))
            ) : (
              <p>You have no listings yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyListings;
