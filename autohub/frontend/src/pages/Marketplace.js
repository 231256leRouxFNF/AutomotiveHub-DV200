import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import marketplaceData from '../data/marketplace.json';
import { listingService } from '../services/api'; // Import listingService
import './Marketplace.css';

// Local marketplace images
import Top1 from '../assets/Marketplace-page/Top-Section-1.jpg';
import Top2 from '../assets/Marketplace-page/Top-Section-2.jpg';
import Top3 from '../assets/Marketplace-page/Top-Section-3.jpg';
import Top4 from '../assets/Marketplace-page/Top-Section-4.jpg';

import Img1 from '../assets/Marketplace-page/Image-1.jpg';
import Img2 from '../assets/Marketplace-page/Image-2.jpg';
import Img3 from '../assets/Marketplace-page/Image-3.jpg';
import Img4 from '../assets/Marketplace-page/Image-4.jpg';
import Img5 from '../assets/Marketplace-page/Image-5.jpg';
import Img6 from '../assets/Marketplace-page/Image-6.jpg';
import Img7 from '../assets/Marketplace-page/Image-7.jpg';
import Img8 from '../assets/Marketplace-page/Image-8.jpg';
import Img9 from '../assets/Marketplace-page/Image-9.jpg';
import Img10 from '../assets/Marketplace-page/Image-10.jpg';
import Img11 from '../assets/Marketplace-page/Image-11.jpg';
import Img12 from '../assets/Marketplace-page/Image-12.jpg';

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
          listingService.getAllListings() // Use new listing service
        ]);
        if (!cancelled) {
          const incomingFeatured = Array.isArray(f.data) ? f.data : [];
          const incomingCategories = Array.isArray(c.data) ? c.data : [];
          const incomingListings = Array.isArray(a) ? a : []; // `a` is already data from service

          const fallbackFeatured = (marketplaceData.featured || []);
          const fallbackCategories = (marketplaceData.categories || []);
          const fallbackListings = (marketplaceData.listings || []);

          const featuredImages = [Top1, Top4, Top3, Top2];
          const listingImages = [Img1, Img2, Img3, Img4, Img5, Img6, Img7, Img8, Img9, Img10, Img11, Img12];

          const featuredToUse = (incomingFeatured.length ? incomingFeatured : fallbackFeatured).map((item, idx) => ({
            ...item,
            image: item.image || featuredImages[idx % featuredImages.length] // Use existing image if available
          }));

          const listingsToUse = (incomingListings.length ? incomingListings : fallbackListings).map((item, idx) => ({
            ...item,
            // Parse imageUrls if it's a JSON string, and use the first URL or a fallback image
            image: (item.imageUrls && JSON.parse(item.imageUrls)[0]) || listingImages[idx % listingImages.length],
            price: parseFloat(item.price).toFixed(2), // Format price
            location: item.location || 'Unknown',
            condition: item.condition || 'N/A',
            seller: item.owner_username || 'Anonymous' // Assuming owner_username is available from backend
          }));

          setFeaturedListings(featuredToUse);
          setCategories(incomingCategories.length ? incomingCategories : fallbackCategories);
          setAllListings(listingsToUse);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Error loading marketplace data:", e);
          const featuredImages = [Top1, Top2, Top3, Top4];
          const listingImages = [Img1, Img2, Img3, Img4, Img5, Img6, Img7, Img8, Img9, Img10, Img11, Img12];
          const fallbackFeatured = (marketplaceData.featured || []).map((item, idx) => ({
            ...item,
            image: featuredImages[idx % featuredImages.length]
          }));
          const fallbackListings = (marketplaceData.listings || []).map((item, idx) => ({
            ...item,
            image: listingImages[idx % listingImages.length]
          }));
          setFeaturedListings(fallbackFeatured);
          setCategories((marketplaceData.categories || []));
          setAllListings(fallbackListings);
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
                  <div className="listing-price">R {listing.price}</div>
                  <div className="listing-info">
                    <div className="listing-location">📍 {listing.location}</div>
                    <div className="listing-condition">🏷️ {listing.condition}</div>
                    {/* <div className="listing-seller">👤 {listing.seller}</div> */}
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
