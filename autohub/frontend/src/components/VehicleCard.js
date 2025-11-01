import React from 'react';
import api from '../services/api';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  console.log(' VehicleCard vehicle data:', vehicle); // Add this line

  const handleImageError = (e) => {
    console.log(' Image failed to load:', e.target.src); // Add this line
    e.target.src = 'https://via.placeholder.com/300x200/393D47/8C8D8B?text=No+Image';
  };

  const resolveImageSrc = () => {
    const candidate = (
      vehicle.image_url ||
      vehicle.imageUrl ||
      vehicle.primary_image ||
      vehicle.image ||
      (Array.isArray(vehicle.images) && vehicle.images[0]) ||
      ''
    );

    console.log('🖼️ Image candidate:', candidate); // Add this line

    if (!candidate) {
      return 'https://via.placeholder.com/300x200/393D47/8C8D8B?text=No+Image';
    }

    const src = String(candidate);
    
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    
    const baseURL = process.env.REACT_APP_API_URL || 'https://automotivehub-dv200-1.onrender.com';
    if (src.startsWith('/uploads')) {
      const resolved = `${baseURL}${src}`;
      console.log('✅ Resolved image URL:', resolved); // Add this line
      return resolved;
    }
    
    return src;
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-image-container">
        <img
          src={resolveImageSrc()}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="vehicle-image"
          onError={handleImageError}
        />
        <div className="vehicle-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit && onEdit(vehicle)}
            title="Edit Vehicle"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.013 1.68701C11.5047 1.19524 12.2953 1.19524 12.787 1.68701L14.313 3.21301C14.8048 3.70478 14.8048 4.49522 14.313 4.98699L13.0669 6.23309L9.76689 2.93309L11.013 1.68701Z" fill="white"/>
              <path d="M8.99989 4.20008L12.2999 7.50008L5.16656 14.6334H1.86656V11.3334L8.99989 4.20008Z" fill="white"/>
            </svg>
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete && onDelete(vehicle)}
            title="Delete Vehicle"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.66656 2.66675C6.66656 2.29871 6.96519 2.00008 7.33322 2.00008H8.66656C9.03459 2.00008 9.33322 2.29871 9.33322 2.66675V3.33341H6.66656V2.66675Z" fill="white"/>
              <path d="M2.66656 4.66675C2.29852 4.66675 1.99989 4.96537 1.99989 5.33341C1.99989 5.70145 2.29852 6.00008 2.66656 6.00008H13.3332C13.7013 6.00008 13.9999 5.70145 13.9999 5.33341C13.9999 4.96537 13.7013 4.66675 13.3332 4.66675H2.66656Z" fill="white"/>
              <path d="M4.66656 7.33341C4.29852 7.33341 3.99989 7.63204 3.99989 8.00008V12.0001C3.99989 12.7365 4.59651 13.3334 5.33322 13.3334H10.6666C11.4033 13.3334 11.9999 12.7365 11.9999 12.0001V8.00008C11.9999 7.63204 11.7013 7.33341 11.3332 7.33341C10.9652 7.33341 10.6666 7.63204 10.6666 8.00008V12.0001H5.33322V8.00008C5.33322 7.63204 5.03459 7.33341 4.66656 7.33341Z" fill="white"/>
            </svg>
          </button>
        </div>
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