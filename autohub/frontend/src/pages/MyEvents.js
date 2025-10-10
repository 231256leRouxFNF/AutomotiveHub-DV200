import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { eventService, authService } from '../services/api';
import './PageLayout.css';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    let cancelled = false;
    const loadEvents = async () => {
      try {
        if (!currentUser || !currentUser.id) {
          console.warn('User not authenticated for MyEvents.');
          setEvents([]);
          // Optionally redirect to login
          // navigate('/login');
          return;
        }
        const res = await eventService.getEventsByUserId(currentUser.id);
        if (!cancelled) setEvents(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!cancelled) {
          console.error('Error fetching my events:', e);
          setEvents([]);
        }
      }
    };
    loadEvents();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event.');
      }
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`); // Assuming an edit event page exists
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">My Events</h1>
        <section className="section">
          <h2 className="section-title">My Created Events</h2>
          <div className="section-content grid">
            {events.length > 0 ? (
              events.map(event => (
                <div className="card" key={event.id}>
                  <strong>{event.title}</strong>
                  <p className="muted">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="muted">Location: {event.location}</p>
                  <button className="btn primary-btn mt-8" onClick={() => handleEditEvent(event.id)}>Edit</button>
                  <button className="btn secondary-btn mt-8" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                </div>
              ))
            ) : (
              <p>You have not created any events yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyEvents;
