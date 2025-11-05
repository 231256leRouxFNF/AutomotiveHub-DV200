import React from 'react';
import './ImageModal.css';

const ImageModal = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt || 'Zoomed'} className="image-modal-img" />
        <button className="image-modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ImageModal;
