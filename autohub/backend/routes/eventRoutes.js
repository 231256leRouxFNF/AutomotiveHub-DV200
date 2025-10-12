// autohub/backend/routes/eventRoutes.js

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth } = require('../middleware/auth'); // Assuming you have an auth middleware

// Get all events
router.get('/', eventController.getAllEvents);

// Get events by userId
router.get('/user/:userId', eventController.getEventsByUserId);

// Get a single event by ID
router.get('/:id', eventController.getEventById);

// Create a new event (requires authentication)
router.post('/', auth, eventController.createEvent);

// Update an event (requires authentication and authorization)
router.put('/:id', auth, eventController.updateEvent);

// Delete an event (requires authentication and authorization)
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
