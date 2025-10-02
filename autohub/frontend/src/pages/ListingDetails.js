import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import listingStatic from '../data/listingDetails.json';
import './ListingDetails.css';

const ListingDetails = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [vehicleSpecs, setVehicleSpecs] = useState([]);
  const [relatedListings, setRelatedListings] = useState([]);
  const [details, setDetails] = useState({ title: '', price: '', description: '', tags: [], location: '' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [d, r] = await Promise.all([
          axios.get(`/api/listings/${id}`),
          axios.get(`/api/listings/${id}/related`)
        ]);
        if (!cancelled) {
          const fallback = listingStatic.listing || {};
          const infoRaw = d.data || {};
          const info = (infoRaw && Object.keys(infoRaw).length) ? infoRaw : fallback;

          setDetails({
            title: info.title || '',
            price: info.price || '',
            description: info.description || '',
            tags: info.tags || [],
            location: info.location || ''
          });
          setVehicleImages(Array.isArray(info.images) && info.images.length ? info.images : (fallback.images || []));
          setVehicleSpecs(Array.isArray(info.specs) && info.specs.length ? info.specs : (fallback.specs || []));

          const rData = Array.isArray(r.data) && r.data.length ? r.data : (listingStatic.related || []);
          setRelatedListings(rData);
        }
      } catch (e) {
        if (!cancelled) {
          const fb = listingStatic.listing || {};
          setVehicleImages(fb.images || []);
          setVehicleSpecs(fb.specs || []);
          setRelatedListings(listingStatic.related || []);
          setDetails({ title: fb.title || '', price: fb.price || '', description: fb.description || '', tags: fb.tags || [], location: fb.location || '' });
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);




  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === vehicleImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? vehicleImages.length - 1 : prevIndex - 1
    );
  };

  const handleMessageSeller = () => {
    // Handle message seller action
    console.log('Message seller clicked');
  };

  const handleAddToWatchlist = () => {
    // Handle add to watchlist action
    console.log('Add to watchlist clicked');
  };

  const handleShareListing = () => {
    // Handle share listing action
    console.log('Share listing clicked');
  };

  const handleViewDetails = (listingId) => {
    // Handle view details action for related listings
    console.log('View details for listing:', listingId);
  };

  return (
    <div className="listing-details">
      <Header />
      
      <div className="listing-container">
        {/* Main Image Carousel */}
        <div className="image-carousel">
          <div className="carousel-container">
            <div 
              className="carousel-slides"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {vehicleImages.map((image, index) => (
                <div key={index} className="carousel-slide">
                  <img src={image} alt={`Vehicle view ${index + 1}`} />
                </div>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <button className="carousel-btn prev-btn" onClick={prevImage}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7.59155 2.79047C7.85473 2.57583 8.24266 2.59097 8.48795 2.83627C8.73323 3.08156 8.74838 3.4695 8.53377 3.73266L8.48795 3.78369L4.27167 7.99997L8.48795 12.2163L8.53377 12.2673C8.74838 12.5304 8.73323 12.9184 8.48795 13.1637C8.24266 13.409 7.85473 13.4242 7.59155 13.2095L7.54057 13.1637L2.85053 8.47366C2.58888 8.21203 2.58888 7.78792 2.85053 7.52628L7.54057 2.83627L7.59155 2.79047Z" fill="white"/>
                <path d="M12.6896 7.32996C13.0597 7.32996 13.3596 7.62992 13.3596 7.99996C13.3596 8.37 13.0597 8.66996 12.6896 8.66996L3.30965 8.66996C2.93962 8.66996 2.63965 8.37 2.63965 7.99996C2.63965 7.62992 2.93962 7.32996 3.30965 7.32996L12.6896 7.32996Z" fill="white"/>
              </svg>
            </button>
            
            <button className="carousel-btn next-btn" onClick={nextImage}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.6906 7.32996C13.0607 7.32996 13.3606 7.62992 13.3606 7.99996C13.3606 8.37 13.0607 8.66996 12.6906 8.66996L3.31063 8.66996C2.9406 8.66996 2.64062 8.37 2.64062 7.99996C2.64062 7.62992 2.9406 7.32996 3.31063 7.32996L12.6906 7.32996Z" fill="white"/>
                <path d="M7.51263 2.83627C7.75792 2.59097 8.14585 2.57583 8.40903 2.79047L8.46008 2.83627L13.1501 7.52629C13.4117 7.78793 13.4117 8.21204 13.1501 8.47367L8.46008 13.1637C8.19844 13.4254 7.77427 13.4254 7.51263 13.1637C7.251 12.902 7.251 12.4779 7.51263 12.2163L11.7289 7.99998L7.51263 3.78369L7.46687 3.73266C7.2522 3.4695 7.26735 3.08157 7.51263 2.83627Z" fill="white"/>
              </svg>
            </button>
            
            {/* Carousel Indicators */}
            <div className="carousel-indicators">
              {vehicleImages.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Left Column - Vehicle Details */}
          <div className="vehicle-details">
            <div className="details-card">
              <h1 className="vehicle-title">{details.title}</h1>
              
              <div className="price">{details.price}</div>
              
              <div className="vehicle-tags">
                {(details.tags || []).map((t, idx) => (<span key={idx} className="tag">{t}</span>))}
              </div>
              
              <div className="description-section">
                <h2 className="section-title">Description</h2>
                <p className="description-text">{details.description}</p>
              </div>
              
              <div className="seller-section">
                <h2 className="section-title">About the Seller</h2>
                <div className="seller-info">
                  <div className="seller-avatar">
                    <img 
                      src="https://api.builder.io/api/v1/image/assets/TEMP/ae31b99bc64c2e0d9f45b42a9c12fe20b5d30086?width=128" 
                      alt="Seller" 
                    />
                  </div>
                  <div className="seller-details">
                    <h3 className="seller-name">Kelvin "Gearhead" de Koker</h3>
                    <p className="seller-join-date">Joined: January 2023</p>
                    <div className="seller-location">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12.6838 6.42773C12.6264 5.26844 12.141 4.16801 11.3164 3.34337C10.4917 2.51873 9.39132 2.03333 8.23202 1.97589L7.99973 1.97C6.75587 1.97 5.56264 2.46383 4.68309 3.34337C3.80355 4.22292 3.30973 5.41614 3.30973 6.66001C3.30973 8.10674 4.12498 9.66636 5.18429 11.0582C6.20792 12.403 7.38299 13.4915 7.99973 14.0267C8.61646 13.4915 9.79151 12.403 10.8151 11.0582C11.8745 9.66636 12.6897 8.10674 12.6897 6.66001L12.6838 6.42773Z" fill="#8C8D8B"/>
                      </svg>
                      Cape Town, South Africa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Price and Actions */}
          <div className="sidebar">
            <div className="price-card">
              <div className="price-display">{details.price}</div>
              <div className="location">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15.803 8.05225C15.7318 6.61611 15.1305 5.2529 14.1089 4.23133C13.0874 3.20976 11.7242 2.60845 10.288 2.53729L10.0003 2.53C8.45938 2.53 6.9812 3.14175 5.89161 4.23133C4.80202 5.32092 4.19027 6.79908 4.19027 8.33999C4.19027 10.1322 5.20021 12.0643 6.51249 13.7885C7.78057 15.4545 9.23626 16.8029 10.0003 17.4659C10.7643 16.8029 12.2199 15.4545 13.488 13.7885C14.8003 12.0643 15.8103 10.1322 15.8103 8.33999L15.803 8.05225Z" fill="#8C8D8B"/>
                </svg>
                {details.location}
              </div>
              
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleMessageSeller}>
                  <svg width="16" height="16" viewBox="0 0 17 16" fill="none">
                    <path d="M14.0317 3.31005C14.0317 3.13235 13.9611 2.96199 13.8354 2.83634C13.7097 2.71069 13.5394 2.64005 13.3617 2.64005L3.98168 2.64005C3.80398 2.64005 3.63362 2.71069 3.50797 2.83634C3.38232 2.96199 3.31168 3.13235 3.31168 3.31005L3.31168 12.4126L4.84797 10.8764L4.89704 10.8319C5.01627 10.7341 5.16618 10.68 5.32168 10.68L13.3617 10.68C13.5394 10.68 13.7097 10.6094 13.8354 10.4837C13.9611 10.3581 14.0317 10.1877 14.0317 10.01L14.0317 3.31005Z" fill="white"/>
                  </svg>
                  Message Seller
                </button>
                
                <button className="btn btn-secondary" onClick={handleAddToWatchlist}>
                  <svg width="16" height="16" viewBox="0 0 17 16" fill="none">
                    <path d="M12.1915 3.31005C12.1915 3.13235 12.1209 2.96199 11.9952 2.83634C11.8696 2.71069 11.6992 2.64005 11.5215 2.64005L4.82152 2.64005C4.64383 2.64005 4.47347 2.71069 4.34781 2.83634C4.22216 2.96199 4.15152 3.13235 4.15152 3.31005L4.15152 12.8752L7.83914 10.7684L7.91833 10.7298C8.10754 10.6525 8.32368 10.6654 8.50391 10.7684L12.1915 12.8752L12.1915 3.31005Z" fill="#F4F4F6"/>
                  </svg>
                  Add to Watchlist
                </button>
                
                <button className="btn btn-ghost" onClick={handleShareListing}>
                  <svg width="16" height="16" viewBox="0 0 17 16" fill="none">
                    <path d="M14.0122 3.33002C14.0122 2.58996 13.4123 1.99002 12.6722 1.99002C11.9321 1.99002 11.3322 2.58996 11.3322 3.33002C11.3322 4.07009 11.9321 4.67002 12.6722 4.67002C13.4123 4.67002 14.0122 4.07009 14.0122 3.33002Z" fill="#F4F4F6"/>
                  </svg>
                  Share Listing
                </button>
              </div>
            </div>
            
            <div className="specs-card">
              <h3 className="specs-title">Specifications</h3>
              <div className="specs-table">
                {vehicleSpecs.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <div className="spec-label">{spec.label}</div>
                    <div className="spec-value">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Listings */}
        <div className="related-listings">
          <h2 className="section-title">More Listings You Might Like</h2>
          <div className="listings-grid">
            {relatedListings.map((listing) => (
              <div key={listing.id} className="listing-card">
                <div className="listing-image">
                  <img src={listing.image} alt={listing.title} />
                </div>
                <div className="listing-info">
                  <h3 className="listing-title">{listing.title}</h3>
                  <div className="listing-price">{listing.price}</div>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(listing.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="listing-footer">
        <div className="newsletter-section">
          <h3 className="newsletter-title">Stay up-to-date on the latest car trends!</h3>
          <form className="newsletter-form">
            <div className="newsletter-input-group">
              <svg className="mail-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14.3401 4.09469C14.6522 3.89603 15.0665 3.9881 15.2652 4.30014C15.4639 4.61222 15.3718 5.02655 15.0598 5.22532L9.03572 9.06211C9.02808 9.06694 9.02058 9.07196 9.0128 9.07652C8.74447 9.23236 8.44391 9.32375 8.13537 9.34412L8.00325 9.34807C7.64868 9.34807 7.30022 9.25454 6.99362 9.07652C6.98585 9.07196 6.97775 9.067 6.97011 9.06211L0.940094 5.22532L0.884477 5.1854C0.61785 4.97508 0.548403 4.59282 0.734645 4.30014C0.920932 4.0075 1.29684 3.90816 1.60028 4.06067L1.65982 4.09469L7.67019 7.9197C7.77149 7.97772 7.88647 8.00807 8.00325 8.00807L8.09088 8.00277C8.17664 7.99145 8.25939 7.96284 8.33496 7.9197L14.3401 4.09469Z" fill="#8C8D8B"/>
              </svg>
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
            </div>
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
        
        <div className="footer-bottom">
          <div className="language-selector">
            <button className="language-btn">English</button>
          </div>
          <div className="copyright">© 2025 AutoHub.</div>
          <div className="social-links">
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10.8354 5.85C10.8354 5.40974 11.0104 4.98763 11.3217 4.67633C11.633 4.36502 12.0552 4.19 12.4954 4.19H14.1554V2.53L12.4954 2.53C11.6148 2.53 10.7707 2.88003 10.1481 3.50266C9.5254 4.12527 9.17539 4.96947 9.17539 5.85L9.17539 8.33999C9.17539 8.7984 8.8038 9.17 8.34539 9.17H6.68539L6.68539 10.83H8.34539C8.8038 10.83 9.17539 11.2016 9.17539 11.66V17.47H10.8354V11.66C10.8354 11.2016 11.207 10.83 11.6654 10.83H13.5077L13.9227 9.17H11.6654C11.207 9.17 10.8354 8.7984 10.8354 8.33999L10.8354 5.85Z" fill="#8C8D8B"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M11.3083 3.02292C12.7334 2.2804 14.5927 2.32667 16.0694 3.49061C16.1416 3.47318 16.2252 3.45102 16.319 3.41928C16.5499 3.34127 16.798 3.2329 17.0332 3.11776C17.2662 3.00362 17.4749 2.88848 17.6256 2.80164C17.7007 2.75843 17.7605 2.72227 17.8008 2.69789C17.8208 2.68572 17.8365 2.67631 17.8462 2.67034C17.8507 2.66748 17.8539 2.66508 17.8559 2.66386H17.8575C18.1541 2.47652 18.537 2.49531 18.8131 2.71167C19.0545 2.90095 19.1688 3.20523 19.1195 3.50115L19.0879 3.62759V3.62921L19.0871 3.63084C19.0865 3.63246 19.0855 3.63486 19.0846 3.63732C19.0829 3.6422 19.081 3.64876 19.0781 3.65678C19.0725 3.67304 19.0649 3.69574 19.0546 3.72405C19.0341 3.78089 19.0037 3.86145 18.9647 3.95992C18.887 4.15636 18.7717 4.42863 18.6202 4.73723C18.3705 5.24591 18.0021 5.88891 17.5162 6.45721C18.5868 15.1094 9.18603 21.3675 1.60764 16.739L1.24208 16.5071C0.931048 16.3011 0.79645 15.9119 0.91219 15.5572C1.02802 15.2028 1.36568 14.9691 1.73814 14.9858C2.86761 15.0371 3.98536 14.8026 4.9479 14.3212C1.32816 12.3239 -0.264295 7.59951 1.80136 3.79861L1.85567 3.71189C1.99321 3.51963 2.20817 3.39348 2.44655 3.36903C2.71896 3.34123 2.98782 3.45016 3.1647 3.65921C4.63275 5.39399 6.81758 6.48428 9.08087 6.66228C9.09 5.00821 10.0208 3.69373 11.3083 3.02292Z" fill="#8C8D8B"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.4691 5.85C17.4691 4.01641 15.9827 2.53 14.1491 2.53L5.84914 2.53C4.01555 2.53 2.52914 4.01641 2.52914 5.85L2.52914 14.15C2.52914 15.9835 4.01555 17.47 5.84914 17.47L14.1491 17.47C15.9827 17.47 17.4691 15.9835 17.4691 14.15L17.4691 5.85Z" fill="#8C8D8B"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ListingDetails;
