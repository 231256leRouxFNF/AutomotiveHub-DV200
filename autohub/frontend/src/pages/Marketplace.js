import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Marketplace.css';

const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allListings, setAllListings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [f, c, a] = await Promise.all([
          axios.get('/api/featured-listings'),
          axios.get('/api/categories'),
          axios.get('/api/listings')
        ]);
        if (!cancelled) {
          const incomingFeatured = Array.isArray(f.data) ? f.data : [];
          const incomingCategories = Array.isArray(c.data) ? c.data : [];
          const incomingListings = Array.isArray(a.data) ? a.data : [];

          const fallbackFeatured = [
            {
              id: 'fl-1',
              title: '2019 BMW M2 Competition',
              description: 'Low miles, pristine condition, performance pack.',
              price: '$52,900',
              image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop'
            },
            {
              id: 'fl-2',
              title: 'Toyota GR Yaris',
              description: 'Stage 1 tune, forged wheels, immaculate.',
              price: '$38,400',
              image: 'https://images.unsplash.com/photo-1619523440439-89143c4eb1b5?q=80&w=1200&auto=format&fit=crop'
            }
          ];

          const fallbackCategories = [
            { name: 'cars', icon: '🚗' },
            { name: 'parts', icon: '🔧' },
            { name: 'accessories', icon: '🧰' },
            { name: 'wheels', icon: '🛞' }
          ];

          const fallbackListings = [
            {
              id: 'al-1',
              title: 'Audi S4 B9',
              price: '$27,500',
              location: 'San Diego, CA',
              condition: 'Used - Excellent',
              seller: 'alex_c',
              image: 'https://images.unsplash.com/photo-1515923162063-5a5b89c57cde?q=80&w=1200&auto=format&fit=crop'
            },
            {
              id: 'al-2',
              title: 'HKS Blow Off Valve',
              price: '$180',
              location: 'Austin, TX',
              condition: 'Used - Good',
              seller: 'marco_r',
              image: 'https://images.unsplash.com/photo-1571769199112-3a88f66f2827?q=80&w=1200&auto=format&fit=crop'
            },
            {
              id: 'al-3',
              title: 'Ford Mustang GT 5.0',
              price: '$31,900',
              location: 'Orlando, FL',
              condition: 'Used - Excellent',
              seller: 'priya_s',
              image: 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?q=80&w=1200&auto=format&fit=crop'
            }
          ];

          setFeaturedListings(incomingFeatured.length ? incomingFeatured : fallbackFeatured);
          setCategories(incomingCategories.length ? incomingCategories : fallbackCategories);
          setAllListings(incomingListings.length ? incomingListings : fallbackListings);
        }
      } catch (e) {
        if (!cancelled) {
          setFeaturedListings([]);
          setCategories([]);
          setAllListings([]);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);




  const handleApplyFilters = () => {
    // Filter logic would go here
    console.log('Applying filters:', { selectedCategory, selectedCondition, selectedMake, minPrice, maxPrice });
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedMake('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribing email:', email);
    setEmail('');
  };

  const handleViewDetails = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="marketplace">
      <Header />
      
      <div className="marketplace-container">
        <div className="marketplace-header">
          <h1 className="marketplace-title">Marketplace</h1>
        </div>

        {/* Featured Listings Section */}
        <section className="featured-section">
          <h2 className="section-title">Featured Listings</h2>
          <div className="featured-grid">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="featured-card" onClick={() => handleListingClick(listing.id)}>
                <img src={listing.image} alt={listing.title} className="featured-image" />
                <div className="featured-content">
                  <h3 className="featured-title">{listing.title}</h3>
                  <p className="featured-description">{listing.description}</p>
                  <div className="featured-price">{listing.price}</div>
                  <button
                    className="view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(listing.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shop by Category Section */}
        <section className="category-section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category.name} className="category-item">
                <div className="category-icon">{category.icon}</div>
                <span className="category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* All Listings Section */}
        <section className="listings-section">
          <h2 className="section-title">All Listings</h2>
          
          {/* Filters */}
          <div className="filters-container">
            <div className="search-row">
              <input
                type="text"
                placeholder="Search listings..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-row">
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Category</option>
                <option value="cars">Cars</option>
                <option value="parts">Parts</option>
                <option value="accessories">Accessories</option>
              </select>
              
              <select
                className="filter-select"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="">Condition</option>
                <option value="new">New</option>
                <option value="used-excellent">Used - Excellent</option>
                <option value="used-good">Used - Good</option>
              </select>
              
              <select
                className="filter-select"
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
              >
                <option value="">Make</option>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="ford">Ford</option>
                <option value="honda">Honda</option>
              </select>
            </div>
            
            <div className="price-row">
              <input
                type="text"
                placeholder="Min Price"
                className="price-input"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="text"
                placeholder="Max Price"
                className="price-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <button className="apply-filters-btn" onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear Filters
              </button>
              
              <div className="sort-container">
                <label>Sort by:</label>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Newest">Newest</option>
                  <option value="Price Low to High">Price Low to High</option>
                  <option value="Price High to Low">Price High to Low</option>
                  <option value="Most Popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Listings Grid */}
          <div className="listings-grid">
            {allListings.map((listing) => (
              <div
                key={listing.id}
                className="listing-card"
                onClick={() => handleListingClick(listing.id)}
              >
                <img src={listing.image} alt={listing.title} className="listing-image" />
                <div className="listing-content">
                  <h3 className="listing-title">{listing.title}</h3>
                  <div className="listing-price">{listing.price}</div>
                  <div className="listing-info">
                    <div className="listing-location">📍 {listing.location}</div>
                    <div className="listing-condition">🏷️ {listing.condition}</div>
                    <div className="listing-seller">👤 {listing.seller}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Newsletter Section */}
        <footer className="marketplace-footer">
          <div className="newsletter-section">
            <h3 className="newsletter-title">Stay up-to-date on the latest car trends!</h3>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="email-input-container">
                <span className="email-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="subscribe-btn">Subscribe</button>
            </form>
          </div>
          
          <div className="footer-content">
            <div className="language-selector">
              <button className="language-btn">English</button>
            </div>
            <div className="copyright">© 2025 AutoHub.</div>
            <div className="social-links">
              <span className="social-icon">📘</span>
              <span className="social-icon">🐦</span>
              <span className="social-icon">📷</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Marketplace;
