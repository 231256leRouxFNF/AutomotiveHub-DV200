import React, { useState } from 'react';
import api from '../services/api';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get the correct image URL
  const getImageUrl = () => {
    // If it's a Cloudinary URL, use it directly
    if (vehicle.image_url?.includes('cloudinary')) {
      return vehicle.image_url;
    }
    
    // If it's a local path, construct the full URL
    if (vehicle.image_url?.startsWith('/uploads')) {
      return `http://localhost:5000${vehicle.image_url}`;
    }
    
    // If images is a JSON array (new Cloudinary format)
    if (vehicle.images) {
      try {
        const imagesArray = typeof vehicle.images === 'string' 
          ? JSON.parse(vehicle.images) 
          : vehicle.images;
        return imagesArray[0] || null;
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    
    // Fallback
    return vehicle.primary_image || null;
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
          <div className="no-image-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#393D47"/>
              <path d="M16 20C16 18.8954 16.8954 18 18 18C19.1046 18 20 18.8954 20 20C20 21.1046 19.1046 22 18 22C16.8954 22 16 21.1046 16 20Z" fill="#8C8D8B"/>
              <path d="M28 20C28 18.8954 28.8954 18 30 18C31.1046 18 32 18.8954 32 20C32 21.1046 31.1046 22 30 22C28.8954 22 28 21.1046 28 20Z" fill="#8C8D8B"/>
              <path d="M16 30C16 28.8954 16.8954 28 18 28H30C31.1046 28 32 28.8954 32 30C32 31.1046 31.1046 32 30 32H18C16.8954 32 16 31.1046 16 30Z" fill="#8C8D8B"/>
            </svg>
            <p>No Image</p>
          </div>
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