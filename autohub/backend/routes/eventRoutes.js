// autohub/backend/routes/eventRoutes.js

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth } = require('../middleware/auth');

// Get all events
router.get('/', eventController.getAllEvents);

// Get events by userId - SPECIFIC route
router.get('/user/:userId', eventController.getEventsByUserId);

// Get a single event by ID - GENERIC route (must be last)
router.get('/:id', eventController.getEventById);

// Create a new event
router.post('/', auth, eventController.createEvent);

// Update an event
router.put('/:id', auth, eventController.updateEvent);

// Delete an event
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
