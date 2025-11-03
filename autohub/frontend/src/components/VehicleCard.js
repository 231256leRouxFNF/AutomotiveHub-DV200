import React from 'react';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onDelete }) => {
  const getImageUrl = (vehicle) => {
    // Check for image_url field (Cloudinary URL)
    if (vehicle.image_url) {
      console.log('Image URL found:', vehicle.image_url);
      return vehicle.image_url;
    }
    
    // Check for images field (JSON)
    if (vehicle.images) {
      try {
        const images = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images;
        if (Array.isArray(images) && images.length > 0) {
          const url = images[0].url || images[0].secure_url || images[0];
          console.log('Parsed image URL:', url);
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
      
      {onDelete && (
        <button 
          className="delete-btn" 
          onClick={() => onDelete(vehicle.id)}
          aria-label="Delete vehicle"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default VehicleCard;