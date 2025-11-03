import React from 'react';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onDelete }) => {
  const getImageUrl = (vehicle) => {
    console.log('🔍 Vehicle data:', vehicle);
    
    // Primary: Check for image_url field (Cloudinary URL from database)
    if (vehicle.image_url) {
      console.log('✅ Using image_url:', vehicle.image_url);
      return vehicle.image_url;
    }
    
    console.log('⚠️ No image found for vehicle:', vehicle.id);
    return null;
  };

  const imageUrl = getImageUrl(vehicle);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      if (onDelete) {
        onDelete(vehicle.id);
      }
    }
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-image">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={(e) => {
              console.error('❌ Image failed to load:', imageUrl);
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully:', imageUrl);
            }}
          />
        ) : (
          <div className="vehicle-no-image">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <p>No Image Available</p>
          </div>
        )}
      </div>
      
      <div className="vehicle-card-content">
        <div className="vehicle-card-header">
          <h3 className="vehicle-title">{vehicle.make} {vehicle.model}</h3>
          <span className="vehicle-year">{vehicle.year}</span>
        </div>
        
        <div className="vehicle-card-details">
          {vehicle.color && (
            <div className="vehicle-detail-item">
              <span className="detail-label">Color:</span>
              <span className="detail-value">{vehicle.color}</span>
            </div>
          )}
          
          {vehicle.description && (
            <p className="vehicle-description">{vehicle.description}</p>
          )}
        </div>
        
        <div className="vehicle-card-footer">
          <button 
            className="btn-delete" 
            onClick={handleDelete}
            aria-label="Delete vehicle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
            </svg>
            Delete Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;