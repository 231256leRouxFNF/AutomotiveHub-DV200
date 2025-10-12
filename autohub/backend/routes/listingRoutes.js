// autohub/backend/routes/listingRoutes.js

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { auth } = require('../middleware/auth'); // Assuming you have an auth middleware

// Get all listings
router.get('/', listingController.getAllListings);

// Get listings by user ID
router.get('/user/:userId', listingController.getListingsByUserId);

// Get a single listing by ID
router.get('/:id', listingController.getListingById);

// Create a new listing (requires authentication)
router.post('/', auth, listingController.createListing);

// Update a listing (requires authentication and authorization)
router.put('/:id', auth, listingController.updateListing);

// Delete a listing (requires authentication and authorization)
router.delete('/:id', auth, listingController.deleteListing);

module.exports = router;
