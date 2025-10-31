// autohub/backend/routes/listingRoutes.js

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { auth } = require('../middleware/auth'); // Assuming you have an auth middleware
const multer = require('multer');
const path = require('path');

// Multer configuration for listing images
const listingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Remove the ./ prefix
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadListings = multer({ storage: listingStorage });

// Get all listings
router.get('/', listingController.getAllListings);

// Get listings by user ID
router.get('/user/:userId', listingController.getListingsByUserId);

// Get a single listing by ID
router.get('/:listingId', listingController.getListingById);

// Create a new listing (requires authentication and image upload)
router.post('/', auth, uploadListings.array('images', 10), listingController.createListing);

// Update a listing (requires authentication and authorization, and image upload)
router.put('/:listingId', auth, listingController.updateListing);

// Delete a listing (requires authentication and authorization)
router.delete('/:listingId', auth, listingController.deleteListing);

// Get related listings
router.get('/:listingId/related', listingController.getRelatedListings);

module.exports = router;
