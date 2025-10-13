import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import './CreateListingWizard.css'; // Re-use styling from CreateListingWizard
import { listingService, authService } from '../services/api';

const EditListingWizard = () => {
  const { id } = useParams(); // Get listing ID from URL parameters
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [listingData, setListingData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    year: '',
    make: '',
    model: '',
    mileage: '',
    location: '',
    imageUrls: [], // Existing image URLs as strings
    images: [] // New image file objects
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const fetchedListing = await listingService.getListingById(id);
        setListingData({
          title: fetchedListing.title || '',
          description: fetchedListing.description || '',
          price: fetchedListing.price || '',
          category: fetchedListing.category || '',
          condition: fetchedListing.condition || '',
          year: fetchedListing.year || '',
          make: fetchedListing.make || '',
          model: fetchedListing.model || '',
          mileage: fetchedListing.mileage || '',
          location: fetchedListing.location || '',
          imageUrls: fetchedListing.imageUrls ? JSON.parse(fetchedListing.imageUrls) : [],
          images: []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setErrors({ form: 'Failed to load listing for editing.' });
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    } else {
      setLoading(false);
      setErrors({ form: 'No listing ID provided for editing.' });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setListingData(prevData => ({ ...prevData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
  };

  const handleImageChange = (e) => {
    setListingData(prevData => ({ ...prevData, images: Array.from(e.target.files) }));
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setListingData(prevData => ({
      ...prevData,
      imageUrls: prevData.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!listingData.title) newErrors.title = 'Title is required';
    if (!listingData.category) newErrors.category = 'Category is required';
    if (!listingData.condition) newErrors.condition = 'Condition is required';
    if (!listingData.make) newErrors.make = 'Make is required';
    if (!listingData.model) newErrors.model = 'Model is required';
    if (!listingData.year || isNaN(listingData.year)) newErrors.year = 'Valid year is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Updating listing:', listingData);
    try {
      if (!currentUser || !currentUser.id) {
        setErrors({ form: 'User not authenticated. Please log in.' });
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('title', listingData.title);
      formData.append('description', listingData.description);
      formData.append('price', listingData.price);
      formData.append('category', listingData.category);
      formData.append('condition', listingData.condition);
      formData.append('year', listingData.year);
      formData.append('make', listingData.make);
      formData.append('model', listingData.model);
      formData.append('mileage', listingData.mileage);
      formData.append('location', listingData.location);
      formData.append('existingImageUrls', JSON.stringify(listingData.imageUrls)); // Send existing image URLs

      listingData.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await listingService.updateListing(id, formData); // Use updateListing
      console.log(response.data);
      alert('Listing updated successfully!');
      navigate(`/listing/${id}`); // Redirect to updated listing details page
    } catch (error) {
      console.error('Error updating listing:', error);
      setErrors({ form: error.message || 'Failed to update listing. Please try again.' });
    }
  };

  if (loading) {
    return <div className="page-wrapper"><Header /><main className="page-container"><p>Loading listing for editing...</p></main><Footer /></div>;
  }

  if (errors.form) {
    return <div className="page-wrapper"><Header /><main className="page-container error"><p>{errors.form}</p></main><Footer /></div>;
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Edit Listing</h1>
        <section className="section">
          <h2 className="section-title">Steps</h2>
          <div className="section-content grid">
            <div className={`card ${step === 1 ? 'active' : ''}`}><strong>1. Details</strong><div className="muted">Title, category, condition</div></div>
            <div className={`card ${step === 2 ? 'active' : ''}`}><strong>2. Media</strong><div className="muted">Photos and videos</div></div>
            <div className={`card ${step === 3 ? 'active' : ''}`}><strong>3. Pricing</strong><div className="muted">Price, currency, shipping</div></div>
            <div className={`card ${step === 4 ? 'active' : ''}`}><strong>4. Publish</strong><div className="muted">Preview and submit</div></div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="listing-form">
          {step === 1 && (
            <div className="form-step">
              <h3 className="form-step-title">Vehicle Details</h3>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={listingData.title} onChange={handleChange} className="form-input" />
                {errors.title && <p className="error-message">{errors.title}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={listingData.category} onChange={handleChange} className="form-input">
                    <option value="">Select Category</option>
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="truck">Truck</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <p className="error-message">{errors.category}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="condition">Condition</label>
                  <select id="condition" name="condition" value={listingData.condition} onChange={handleChange} className="form-input">
                    <option value="">Select Condition</option>
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="certified_used">Certified Used</option>
                    <option value="parts">For Parts</option>
                  </select>
                  {errors.condition && <p className="error-message">{errors.condition}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="make">Make</label>
                  <input type="text" id="make" name="make" value={listingData.make} onChange={handleChange} className="form-input" />
                  {errors.make && <p className="error-message">{errors.make}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="model">Model</label>
                  <input type="text" id="model" name="model" value={listingData.model} onChange={handleChange} className="form-input" />
                  {errors.model && <p className="error-message">{errors.model}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <input type="number" id="year" name="year" value={listingData.year} onChange={handleChange} className="form-input" />
                  {errors.year && <p className="error-message">{errors.year}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={listingData.description} onChange={handleChange} className="form-textarea"></textarea>
              </div>
              <button type="button" onClick={nextStep} className="btn primary-btn">Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3 className="form-step-title">Manage Media</h3>
              <div className="form-group">
                <label>Existing Images:</label>
                <div className="existing-images-preview">
                  {listingData.imageUrls.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Listing Image ${index + 1}`} />
                      <button type="button" onClick={() => handleRemoveExistingImage(index)} className="remove-image-btn">X</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="images">Upload New Images</label>
                <input type="file" id="images" name="images" multiple onChange={handleImageChange} className="form-input" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn secondary-btn">Previous</button>
                <button type="button" onClick={nextStep} className="btn primary-btn">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3 className="form-step-title">Pricing & Location</h3>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" name="price" value={listingData.price} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="mileage">Mileage</label>
                <input type="number" id="mileage" name="mileage" value={listingData.mileage} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input type="text" id="location" name="location" value={listingData.location} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn secondary-btn">Previous</button>
                <button type="button" onClick={nextStep} className="btn primary-btn">Next</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h3 className="form-step-title">Review & Publish</h3>
              {/* Display a summary of listingData here */}
              <p>Title: {listingData.title}</p>
              <p>Description: {listingData.description}</p>
              <p>Price: {listingData.price}</p>
              {/* ... other fields ... */}
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn secondary-btn">Previous</button>
                <button type="submit" className="btn primary-btn">Save Changes</button>
              </div>
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditListingWizard;
