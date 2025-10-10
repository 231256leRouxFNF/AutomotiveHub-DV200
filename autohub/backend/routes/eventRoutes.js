// autohub/backend/routes/eventRoutes.js

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
// const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// Get all events
router.get('/', eventController.getAllEvents);

// Get events by userId
router.get('/user/:userId', eventController.getEventsByUserId);

// Get a single event by ID
router.get('/:id', eventController.getEventById);

// Create a new event (requires authentication)
// router.post('/', auth, eventController.createEvent);
router.post('/', eventController.createEvent); // Temporarily without auth

// Update an event (requires authentication and authorization)
// router.put('/:id', auth, eventController.updateEvent);
router.put('/:id', eventController.updateEvent); // Temporarily without auth

// Delete an event (requires authentication and authorization)
// router.delete('/:id', auth, eventController.deleteEvent);
router.delete('/:id', eventController.deleteEvent); // Temporarily without auth

module.exports = router;
