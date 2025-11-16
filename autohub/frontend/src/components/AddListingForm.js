import React, { useState, useRef } from 'react';
import './AddListingForm.css';
import axios from 'axios';

const AddListingForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({
    type: 'vehicle', // vehicle or part
    title: '',
    description: '',
    price: '',
    make: '',
    model: '',
    year: '',
    category: '', // new: category for both types
    condition: '', // new: condition for both types
    mileage: '', // new: mileage for vehicles
    location: '', // new: location for both types
    partCategory: '', // for parts
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = e => {
    setForm({ ...form, type: e.target.value });
  };

  const handleImageChange = e => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    // Append new files, avoid duplicates
    const newFiles = files.filter(f => !imageFiles.some(existing => existing.name === f.name && existing.size === f.size));
    const updatedFiles = [...imageFiles, ...newFiles];
    setImageFiles(updatedFiles);
    // Generate previews for all images
    Promise.all(updatedFiles.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })).then(setImagePreviews);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    // Append new files, avoid duplicates
    const newFiles = files.filter(f => !imageFiles.some(existing => existing.name === f.name && existing.size === f.size));
    const updatedFiles = [...imageFiles, ...newFiles];
    setImageFiles(updatedFiles);
    // Generate previews for all images
    Promise.all(updatedFiles.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })).then(setImagePreviews);
  };
  // Remove image by index
  const handleRemoveImage = idx => {
    const updatedFiles = imageFiles.filter((_, i) => i !== idx);
    setImageFiles(updatedFiles);
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsUploading(true);
    try {
      // Upload images to Cloudinary
      const uploadedImages = [];
      for (const file of imageFiles) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'autohub_listings');
        const res = await axios.post('https://api.cloudinary.com/v1_1/dipwvhvz0/image/upload', data);
        uploadedImages.push({ url: res.data.secure_url, public_id: res.data.public_id });
      }
      // Get userId from localStorage and validate fields
      const token = localStorage.getItem('token');
      const userObj = localStorage.getItem('user');
      let userId = null;
      if (userObj) {
        try {
          const user = JSON.parse(userObj);
          userId = user && user.id ? Number(user.id) : null;
        } catch (e) {
          userId = null;
        }
      }
      if (!userId || isNaN(userId)) {
        setError('User ID is missing or invalid.');
        setIsLoading(false);
        setIsUploading(false);
        return;
      }
      // Validate required fields
      if (!form.title || !form.price || isNaN(Number(form.price))) {
        setError('Title and price are required and must be valid.');
        setIsLoading(false);
        setIsUploading(false);
        return;
      }
      // Prepare payload: always send all required fields for listings table
      const payload = {
        title: form.title || '',
        description: form.description || '',
        price: form.price ? Number(form.price) : 0,
        category: form.category || '',
        condition: form.condition || '',
        year: form.year || '',
        make: form.make || '',
        model: form.model || '',
        mileage: form.mileage ? Number(form.mileage) : 0,
        location: form.location || '',
        userId: userId,
        imageUrls: JSON.stringify(uploadedImages),
      };
      const response = await axios.post('/api/listings', payload, token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : undefined);
      setIsLoading(false);
      setIsUploading(false);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setIsLoading(false);
      setIsUploading(false);
      setError(err.response?.data?.message || 'Failed to add listing.');
    }
  };

  return (
    <form className="add-listing-form" onSubmit={handleSubmit}>
      <button type="button" className="close-btn" onClick={onClose} title="Close form">&times;</button>
      <h2>Add New Listing</h2>
      <div style={{ marginBottom: '16px' }}>
        <label>
          <input
            type="radio"
            name="type"
            value="vehicle"
            checked={form.type === 'vehicle'}
            onChange={handleTypeChange}
          /> Vehicle
        </label>
        <label style={{ marginLeft: '24px' }}>
          <input
            type="radio"
            name="type"
            value="part"
            checked={form.type === 'part'}
            onChange={handleTypeChange}
          /> Part
        </label>
      </div>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
      <input name="category" placeholder="Category (e.g. Coupes, Wheels, Turbo)" value={form.category} onChange={handleChange} />
      <input name="condition" placeholder="Condition (e.g. New, Used)" value={form.condition} onChange={handleChange} />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
      {form.type === 'vehicle' && (
        <>
          <input name="make" placeholder="Make" value={form.make} onChange={handleChange} required />
          <input name="model" placeholder="Model" value={form.model} onChange={handleChange} required />
          <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} required />
          <input name="mileage" type="number" placeholder="Mileage" value={form.mileage} onChange={handleChange} />
        </>
      )}
      {form.type === 'part' && (
        <>
          <input name="partCategory" placeholder="Part Category (e.g. Wheels, Engine, Seats, Turbo)" value={form.partCategory} onChange={handleChange} required />
        </>
      )}
      {/* Drag-and-drop upload area with gallery preview */}
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleFileClick : undefined}
        style={{ cursor: isUploading ? 'wait' : 'pointer', marginBottom: '16px' }}
      >
        {isUploading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>Uploading to cloud...</p>
          </div>
        ) : imagePreviews.length > 0 ? (
          <div className="image-gallery">
            {imagePreviews.map((src, idx) => (
              <div className="image-thumb" key={idx}>
                <img src={src} alt={`Preview ${idx + 1}`} className="image-preview" />
                <button type="button" className="remove-image" onClick={() => handleRemoveImage(idx)} title="Remove image">&times;</button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <p>Drag & drop your listing images here, or click to browse</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
      </div>
      <button type="submit" disabled={isLoading || isUploading}>{isLoading ? 'Adding...' : 'Add Listing'}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddListingForm;
