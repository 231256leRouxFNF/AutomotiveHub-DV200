import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import marketplaceData from '../data/marketplace.json';
import { listingService } from '../services/api'; // Import listingService
import SEO from '../components/SEO'; // ADD THIS
import './Marketplace.css';
import AddListingForm from '../components/AddListingForm';

const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [listingsPerPage] = useState(10); // Number of listings per page
  const [totalListings, setTotalListings] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  // Removed static listings toggle and logic
  const [showStatic, setShowStatic] = useState(() => {
    const saved = localStorage.getItem('showStaticListings');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const offset = (currentPage - 1) * listingsPerPage;
        // Only fetch listings from backend, use static data for categories/featured
        let response;
        // listingService.getAllListings expects no params, so fallback to basic fetch
        if (listingService.getAllListings.length === 0) {
          response = await listingService.getAllListings();
        } else {
          response = await listingService.getAllListings({
            q: searchQuery,
            category: selectedCategory,
            condition: selectedCondition,
            make: selectedMake,
            sort: sortBy,
            minPrice,
            maxPrice,
            limit: listingsPerPage,
            offset: offset,
          });
        }
        // Use correct keys from marketplace.json
        setFeaturedListings(marketplaceData.featured || []);
        setCategories(marketplaceData.categories || []);
        // Handle backend response structure
        let incomingListings = Array.isArray(response) ? response : (response.listings || []);
        setTotalListings(response.totalCount || incomingListings.length || 0);
        setAllListings(incomingListings.map((item, idx) => {
          let images = [];
          try {
            if (item.imageUrls) {
              images = typeof item.imageUrls === 'string' ? JSON.parse(item.imageUrls) : item.imageUrls;
            }
          } catch (e) {
            images = [];
          }
          // Support both Cloudinary and static fallback
          let imageUrl = images[0]?.url || images[0] || marketplaceData.listings?.[idx % (marketplaceData.listings?.length || 1)]?.image || '';
          return {
            ...item,
            image: imageUrl,
            price: item.price ? parseFloat(item.price).toFixed(2) : '',
            location: item.location || 'Unknown',
            condition: item.condition || 'N/A',
            seller: item.owner_username || item.seller || 'Anonymous'
          };
        }));
      } catch (e) {
        if (!cancelled) {
          console.error("Error loading marketplace data:", e);
          setFeaturedListings(marketplaceData.featured || []);
          setCategories(marketplaceData.categories || []);
          setAllListings([]);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [searchQuery, selectedCategory, selectedCondition, selectedMake, sortBy, minPrice, maxPrice, currentPage, listingsPerPage]);




  const handleApplyFilters = async () => {
    // Ensure minPrice and maxPrice are valid numbers if provided
    const parsedMinPrice = minPrice ? parseFloat(minPrice) : null;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : null;

    if ((minPrice && isNaN(parsedMinPrice)) || (maxPrice && isNaN(parsedMaxPrice))) {
      alert('Please enter valid numbers for price range.');
      return;
    }

    try {
      const response = await listingService.getAllListings({
        q: searchQuery,
        category: selectedCategory,
        condition: selectedCondition,
        make: selectedMake,
        sort: sortBy === 'Newest' ? 'created_at_desc' : (sortBy === 'Price Low to High' ? 'price_asc' : (sortBy === 'Price High to Low' ? 'price_desc' : '')),
        minPrice: parsedMinPrice,
        maxPrice: parsedMaxPrice,
        limit: listingsPerPage,
        offset: 0, // Reset to first page on new filter application
      });

      setCurrentPage(1); // Reset to first page
      setTotalListings(response.totalCount || 0);

      setAllListings(response.listings.map((item, idx) => ({
        ...item,
        image: (item.imageUrls && JSON.parse(item.imageUrls)[0]) || marketplaceData.listings[idx % marketplaceData.listings.length].image,
        price: parseFloat(item.price).toFixed(2),
        location: item.location || 'Unknown',
        condition: item.condition || 'N/A',
        seller: item.owner_username || 'Anonymous'
      })));
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('Failed to fetch listings with applied filters.');
      setAllListings([]);
      setTotalListings(0);
    }
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
    <div className="marketplace-wrapper">
      <Header />
      <div className="marketplace-container">
        <div className="marketplace-header">
          <h1 className="marketplace-title">Marketplace</h1>
          <button className="add-listing-btn" onClick={() => setShowAddForm(true)}>
            + Add Listing
          </button>
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
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              
              <select
                className="filter-select"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="certified_used">Certified Used</option>
                <option value="parts">For Parts</option>
              </select>
              
              <select
                className="filter-select"
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
              >
                <option value="">All Makes</option>
                {[...new Set(allListings.map(listing => listing.make))].filter(Boolean).sort().map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
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
                  <option value="created_at_desc">Newest</option>
                  <option value="price_asc">Price Low to High</option>
                  <option value="price_desc">Price High to Low</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Listings Grid - Only dynamic listings */}
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span>Page {currentPage} of {Math.ceil(totalListings / listingsPerPage)}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalListings / listingsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(totalListings / listingsPerPage)}
              className="pagination-btn"
            >
              Next
            </button>
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

      {showAddForm && (
        <div className="add-listing-modal">
          <AddListingForm onSuccess={() => setShowAddForm(false)} onClose={() => setShowAddForm(false)} />
        </div>
      )}
    </div>
  );
};

export default Marketplace;
