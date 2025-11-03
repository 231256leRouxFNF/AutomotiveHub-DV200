import React from 'react';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onDelete }) => {
  const getImageUrl = (vehicle) => {
    console.log('Vehicle data:', vehicle);
    
    // Check for image_url field (Cloudinary URL)
    if (vehicle.image_url) {
      console.log('Image URL found:', vehicle.image_url);
      return vehicle.image_url;
    }
    
    // Check for images field (JSON)
    if (vehicle.images) {
      try {
        const images = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images;
        console.log('Parsed images:', images);
        if (Array.isArray(images) && images.length > 0) {
          const url = images[0].url || images[0].secure_url || images[0];
          console.log('Extracted image URL:', url);
          return url;
        }
      } catch (error) {
        console.error('Error parsing images:', error);
      }
    }
    
    console.log('No image found for vehicle:', vehicle.id);
    return null;
  };

  const imageUrl = getImageUrl(vehicle);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(vehicle.id);
    }
  };

  return (
    <div className="vehicle-card">
      {imageUrl ? (
        <div className="vehicle-image-container">
          <img 
            src={imageUrl} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="vehicle-image"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="vehicle-no-image"><span>📷</span><p>Image Error</p></div>';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
          />
        </div>
      ) : (
        <div className="vehicle-no-image">
          <span>📷</span>
          <p>No Image</p>
        </div>
      )}
      
      <div className="vehicle-info">
        <h3>{vehicle.make} {vehicle.model}</h3>
        <p className="vehicle-year">{vehicle.year}</p>
        {vehicle.color && <p className="vehicle-color">Color: {vehicle.color}</p>}
        {vehicle.description && (
          <p className="vehicle-description">{vehicle.description}</p>
        )}
      </div>
      
      <div className="vehicle-actions">
        <button 
          className="vehicle-delete-btn" 
          onClick={handleDelete}
          aria-label="Delete vehicle"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;