import React, { useState } from 'react';
import api from '../services/api';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  
  // Parse images from Cloudinary
  const getImageUrl = (imageData) => {
    if (!imageData) return null; // Return null instead of placeholder
    
    try {
      // If it's already a URL string
      if (typeof imageData === 'string' && imageData.startsWith('http')) {
        return imageData;
      }
      
      // If it's JSON string, parse it
      const images = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
      
      if (Array.isArray(images) && images.length > 0) {
        return images[0].url || images[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing image:', error);
      return null;
    }
  };

  const imageUrl = getImageUrl(vehicle.image_url || vehicle.images);

  const handleImageError = () => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
  };

  return (
    <div className="vehicle-card">
      {imageUrl && !imageError && (
        <img 
          src={imageUrl} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="vehicle-image"
          onError={handleImageError}
        />
      )}
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
      {onDelete && (
        <button 
          className="delete-btn" 
          onClick={() => onDelete(vehicle.id)}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default VehicleCard;