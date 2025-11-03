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

        {/* Action Buttons */}
        <div className="vehicle-actions">
          <button 
            className="vehicle-delete-btn"
            onClick={() => onDelete(vehicle)}
            title="Delete Vehicle"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.33333 2.66667V1.33333C5.33333 0.965143 5.63181 0.666667 6 0.666667H10C10.3682 0.666667 10.6667 0.965143 10.6667 1.33333V2.66667H13.3333C13.7015 2.66667 14 2.96514 14 3.33333C14 3.70152 13.7015 4 13.3333 4H12.6667V13.3333C12.6667 14.0697 12.0697 14.6667 11.3333 14.6667H4.66667C3.93029 14.6667 3.33333 14.0697 3.33333 13.3333V4H2.66667C2.29848 4 2 3.70152 2 3.33333C2 2.96514 2.29848 2.66667 2.66667 2.66667H5.33333ZM6.66667 2V1.33333H9.33333V2H6.66667ZM4.66667 4V13.3333H11.3333V4H4.66667ZM6.66667 6C6.66667 5.63181 6.36819 5.33333 6 5.33333C5.63181 5.33333 5.33333 5.63181 5.33333 6V11.3333C5.33333 11.7015 5.63181 12 6 12C6.36819 12 6.66667 11.7015 6.66667 11.3333V6ZM10.6667 6C10.6667 5.63181 10.3682 5.33333 10 5.33333C9.63181 5.33333 9.33333 5.63181 9.33333 6V11.3333C9.33333 11.7015 9.63181 12 10 12C10.3682 12 10.6667 11.7015 10.6667 11.3333V6Z" fill="currentColor"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;