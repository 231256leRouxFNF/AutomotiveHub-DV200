import React, { useState } from 'react';
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

  const featuredListings = [
    {
      id: 1,
      title: "1969 Ford Mustang Fastback",
      description: "Iconic classic muscle car, meticulously restored with a powerful V8 engine. A true head-turner.",
      price: "R 1,315,578.75",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/a2438a74805fba7a607483bc46cbeecf6578bbcf?width=696"
    },
    {
      id: 2,
      title: "2020 Honda Civic Type R",
      description: "This meticulously maintained 2020 Honda Civic Type R is a true enthusiast's dream.",
      price: "R 745,494.63",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/27e559388f71c1aa8cfcf19e060631ffa3689cc3?width=696"
    },
    {
      id: 3,
      title: "Jeep Wrangler Rubicon Unlimited",
      description: "Fully customized off-road beast with lifted suspension and new tires. Ready for any terrain.",
      price: "R 857,757.35",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/2a8014ce65799f2f723256b3571371994a7cf7cc?width=696"
    },
    {
      id: 4,
      title: "Audi R8 V10 plus",
      description: "Everyday supercar with a glorious V10 engine, combining luxury with thrilling performance.",
      price: "R 1,719,022.90",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/3e1ff8f1c2f6b18f28350378dc4f94f1152db986?width=696"
    }
  ];

  const categories = [
    { name: "Sedans", icon: "🚗" },
    { name: "SUVs", icon: "🚙" },
    { name: "Coupes", icon: "🏍️" },
    { name: "Trucks", icon: "🔧" },
    { name: "Motorcycles", icon: "⚡" },
    { name: "Performance Parts", icon: "📊" },
    { name: "Exterior", icon: "✨" },
    { name: "Interior", icon: "🏠" }
  ];

  const allListings = [
    {
      id: 5,
      title: "Forged Alloy Racing Wheels (Set of 4)",
      price: "R 49,114.94",
      location: "Cape Town, South Africa",
      condition: "New",
      seller: "SpeedDemon Parts",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/c6803ffd25aa833ff156f53c947b3435c9106cb6?width=636"
    },
    {
      id: 6,
      title: "Recaro Sportster CS Seats (Pair)",
      price: "R 26,311.58",
      location: "Durban, South Africa",
      condition: "Used - Excellent",
      seller: "TrackDay Gear",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/77bf122c4137e3b6ed66babd2f3362ffa780c0f2?width=636"
    },
    {
      id: 7,
      title: "Garrett GT35R Turbo Kit",
      price: "R 21,049.26",
      location: "Pretoria, South Africa",
      condition: "Used - Good",
      seller: "BoostUp Performance",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/5479f548f5d8f2b9ad6823ae7c9286ec0427288e?width=636"
    },
    {
      id: 8,
      title: "Audi S5 OEM LED Headlights (Pair)",
      price: "R 16,664.00",
      location: "Pretoria, South Africa",
      condition: "New",
      seller: "LuxuryCar Parts",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/8c70d732d1ab48ec181ad180f9daaa67f7159a95?width=636"
    },
    {
      id: 9,
      title: "Borla Cat-Back Exhaust System",
      price: "$780",
      location: "Seattle, WA",
      condition: "Used - Minor Scratches",
      seller: "SoundWave Mods",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/8ecf352ee015093d6107b25192a6b5be76da9d58?width=636"
    },
    {
      id: 10,
      title: "Carbon Fiber Rear Spoiler",
      price: "R 7,893.47",
      location: "Western Cape, South Africa",
      condition: "New",
      seller: "AeroDynamics",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/4318eac3ca7400e24e5e0a159a9208d4345f1cdf?width=636"
    },
    {
      id: 11,
      title: "Brembo GT Brake Kit Front",
      price: "R 56,131.36",
      location: "Johannesburg, South Africa",
      condition: "Used - Good",
      seller: "StopFast Racing",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/3ceb5d517c507581cf2e6feada73a55c4e6ce092?width=636"
    },
    {
      id: 12,
      title: "Ohlins Road & Track Coilovers",
      price: "R 36,836.21",
      location: "Pretoria, South Africa",
      condition: "New",
      seller: "RideComfort Tuning",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/84f883de901f059f7d6933582a315a9c0a007fe8?width=636"
    }
  ];

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
