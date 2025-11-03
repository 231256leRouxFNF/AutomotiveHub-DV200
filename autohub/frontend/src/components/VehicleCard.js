import React, { useState } from 'react';
import api from '../services/api';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get the correct image URL
  const getImageUrl = () => {
    // If vehicle has image_url from Cloudinary, use it directly
    if (vehicle.image_url && vehicle.image_url.startsWith('http')) {
      return vehicle.image_url;
    }
    
    // If vehicle has images JSON field
    if (vehicle.images) {
      try {
        const images = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images;
        if (Array.isArray(images) && images.length > 0) {
          return images[0].url || images[0];
        }
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    
    // Fallback to placeholder
    return '/images/placeholder-car.jpg';
  };

  const imageUrl = getImageUrl();

  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-image">
        {!imageError && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            onError={handleImageError}
          />
        ) : (
          <img src="/images/placeholder-car.jpg" alt="Placeholder" />
        )}
      </div>
      
      <div className="vehicle-info">
        <h3 className="vehicle-title">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
        <p className="vehicle-color">Color: {vehicle.color}</p>
        {vehicle.description && (
          <p className="vehicle-description">{vehicle.description}</p>
        )}
        <div className="vehicle-meta">
          <span className="vehicle-date">
            Added: {new Date(vehicle.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;