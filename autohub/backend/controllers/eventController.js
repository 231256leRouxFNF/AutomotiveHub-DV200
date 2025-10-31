
const Event = require('../models/Event');

const eventController = {
  // Create a new event
  createEvent: (req, res) => {
    const eventData = req.body;
    // Assuming userId is obtained from authenticated user
    eventData.userId = req.user.id; 

    Event.create(eventData, (err, result) => {
      if (err) {
        console.error('Error creating event:', err);
        return res.status(500).json({ success: false, message: 'Failed to create event' });
      }
      res.status(201).json({ success: true, message: 'Event created successfully', eventId: result.insertId });
    });
  },

  // Get all events
  getAllEvents: (req, res) => {
    Event.findAll((err, events) => {
      if (err) {
        console.error('Error fetching events:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch events' });
      }
      res.status(200).json(events);
    });
  },

  // Get events by userId
  getEventsByUserId: (req, res) => {
    const { userId } = req.query; // Assuming userId is passed as a query parameter
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    Event.findByUserId(userId, (err, events) => {
      if (err) {
        console.error('Error fetching user events:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch user events' });
      }
      res.status(200).json(events);
    });
  },

  // Get a single event by ID
  getEventById: (req, res) => {
    const { id } = req.params;
    Event.findById(id, (err, event) => {
      if (err) {
        console.error('Error fetching event:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch event' });
      }
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.status(200).json(event);
    });
  },

  // Update an event
  updateEvent: (req, res) => {
    const { id } = req.params;
    const eventData = req.body;

    Event.update(id, eventData, (err, result) => {
      if (err) {
        console.error('Error updating event:', err);
        return res.status(500).json({ success: false, message: 'Failed to update event' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Event not found or no changes made' });
      }
      res.status(200).json({ success: true, message: 'Event updated successfully' });
    });
  },

  // Delete an event
  deleteEvent: (req, res) => {
    const { id } = req.params;

    Event.delete(id, (err, result) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete event' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.status(200).json({ success: true, message: 'Event deleted successfully' });
    });
  },
};

module.exports = eventController;
