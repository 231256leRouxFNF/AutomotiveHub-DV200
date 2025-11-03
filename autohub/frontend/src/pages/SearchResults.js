import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocation, Link } from 'react-router-dom';
import { listingService, eventService } from '../services/api'; // ADD THIS
import SEO from '../components/SEO'; // ADD THIS
import './PageLayout.css';
import './SearchResults.css';

const SearchResults = () => {
  const [listings, setListings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        // FIX: Fetch data from APIs
        const [listingsData, eventsData] = await Promise.all([
          listingService.searchListings({ query: searchTerm }),
          eventService.getAllEvents()
        ]);
        
        // Filter events by search term
        const filteredEvents = eventsData.filter(event => 
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setListings(listingsData || []);
        setEvents(filteredEvents || []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="page-container">
          <h1 className="page-title">Search Results</h1>
          <p className="text-center">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="page-container">
          <h1 className="page-title">Search Results</h1>
          <p className="error-message text-center">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const hasResults = listings.length > 0 || events.length > 0;

  return (
    <>
      <SEO 
        title={`Search Results for "${searchTerm}" - AutoHub`}
        description={`Find vehicles, parts, and more related to "${searchTerm}" on AutoHub marketplace.`}
        keywords={`${searchTerm}, search vehicles, find cars`}
        url={`https://automotivehub-dv200.vercel.app/search?q=${searchTerm}`}
      />
      <div className="page-wrapper">
        <Header />
        <main className="page-container">
          <h1 className="page-title">Search Results</h1>
          <section className="section">
            <h2 className="section-title">Results for "{searchTerm}"</h2>
            <div className="section-content">
              {!hasResults && (
                <p className="text-center">No results found for "{searchTerm}".</p>
              )}

              {listings.length > 0 && (
                <div className="search-results-group">
                  <h3>Listings</h3>
                  <div className="results-grid">
                    {listings.map((listing) => (
                      <Link to={`/listing/${listing.id}`} key={listing.id} className="result-card">
                        {listing.images && JSON.parse(listing.images).length > 0 && (
                          <img src={JSON.parse(listing.images)[0]} alt={listing.title} className="result-image" />
                        )}
                        <div className="result-info">
                          <h4 className="result-title">{listing.title}</h4>
                          <p className="result-price">R {parseFloat(listing.price).toFixed(2)}</p>
                          <p className="result-category">{listing.category}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {events.length > 0 && (
                <div className="search-results-group">
                  <h3>Events</h3>
                  <div className="results-grid">
                    {events.map((event) => (
                      <Link to={`/event/${event.id}`} key={event.id} className="result-card">
                        {event.image_url && (
                          <img src={event.image_url} alt={event.title} className="result-image" />
                        )}
                        <div className="result-info">
                          <h4 className="result-title">{event.title}</h4>
                          <p className="result-date">🗓️ {new Date(event.date).toLocaleDateString()}</p>
                          <p className="result-location">📍 {event.location}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SearchResults;
