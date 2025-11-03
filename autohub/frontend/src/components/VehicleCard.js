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

/* CSS for VehicleCard component */

.vehicle-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.vehicle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.vehicle-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vehicle-no-image {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.vehicle-no-image span {
  font-size: 48px;
  margin-bottom: 8px;
}

.vehicle-no-image p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.vehicle-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.vehicle-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 600;
}

.vehicle-year {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.vehicle-color {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.vehicle-description {
  margin: 12px 0 0 0;
  color: #444;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.vehicle-actions {
  margin-top: auto;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.vehicle-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vehicle-delete-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.vehicle-delete-btn:active {
  transform: translateY(0);
}

.vehicle-delete-btn svg {
  width: 16px;
  height: 16px;
}

/* Empty garage state */
.empty-garage {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Grid layout for vehicles */
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 20px 0;
}