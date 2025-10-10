import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import { eventService, authService } from '../services/api'; // Import authService

const CreateEventWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    imageUrl: '',
    image: null // For file object
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prevData => ({ ...prevData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
  };

  const handleImageChange = (e) => {
    setEventData(prevData => ({ ...prevData, image: e.target.files[0] }));
  };

  const validateStep1 = () => {
    let newErrors = {};
    if (!eventData.title) newErrors.title = 'Title is required';
    if (!eventData.date) newErrors.date = 'Date is required';
    if (!eventData.time) newErrors.time = 'Time is required';
    if (!eventData.location) newErrors.location = 'Location is required';
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
    console.log('Submitting event:', eventData);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setErrors({ form: 'User not authenticated. Please log in.' });
        navigate('/login');
        return;
      }
      const userId = currentUser.id;

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('date', eventData.date);
      formData.append('time', eventData.time);
      formData.append('location', eventData.location);
      if (eventData.image) {
        formData.append('image', eventData.image);
      }

      const response = await eventService.createEvent(formData); // Send FormData
      console.log(response.data);
      navigate('/community'); // Navigate to community feed after event creation
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ form: error.message || 'Failed to create event. Please try again.' });
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Create Event</h1>
        <section className="section">
          <h2 className="section-title">Steps</h2>
          <div className="section-content grid">
            <div className={`card ${step === 1 ? 'active' : ''}`}><strong>1. Details</strong><div className="muted">Title, date, location</div></div>
            <div className={`card ${step === 2 ? 'active' : ''}`}><strong>2. Media</strong><div className="muted">Event image</div></div>
            <div className={`card ${step === 3 ? 'active' : ''}`}><strong>3. Publish</strong><div className="muted">Preview and submit</div></div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="listing-form">
          {step === 1 && (
            <div className="form-step">
              <h3 className="form-step-title">Event Details</h3>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={eventData.title} onChange={handleChange} className="form-input" />
                {errors.title && <p className="error-message">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={eventData.description} onChange={handleChange} className="form-textarea"></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input type="date" id="date" name="date" value={eventData.date} onChange={handleChange} className="form-input" />
                  {errors.date && <p className="error-message">{errors.date}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input type="time" id="time" name="time" value={eventData.time} onChange={handleChange} className="form-input" />
                  {errors.time && <p className="error-message">{errors.time}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input type="text" id="location" name="location" value={eventData.location} onChange={handleChange} className="form-input" />
                {errors.location && <p className="error-message">{errors.location}</p>}
              </div>
              <button type="button" onClick={nextStep} className="btn primary-btn">Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3 className="form-step-title">Upload Media</h3>
              <div className="form-group">
                <label htmlFor="imageUrl">Event Image</label>
                <input type="file" id="imageUrl" name="imageUrl" onChange={handleImageChange} className="form-input" />
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn secondary-btn">Previous</button>
                <button type="button" onClick={nextStep} className="btn primary-btn">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3 className="form-step-title">Review & Publish</h3>
              <p>Title: {eventData.title}</p>
              <p>Description: {eventData.description}</p>
              <p>Date: {eventData.date} at {eventData.time}</p>
              <p>Location: {eventData.location}</p>
              {eventData.image && <p>Image: {eventData.image.name}</p>}
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn secondary-btn">Previous</button>
                <button type="submit" className="btn primary-btn">Publish Event</button>
              </div>
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateEventWizard;
