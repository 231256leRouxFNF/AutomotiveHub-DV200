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
    cb(null, './uploads/'); // Directory where listing images will be stored
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
router.get('/:id', listingController.getListingById);

// Create a new listing (requires authentication and image upload)
router.post('/', auth, uploadListings.array('images', 10), listingController.createListing);

// Update a listing (requires authentication and authorization, and image upload)
router.put('/:id', auth, uploadListings.array('images', 10), listingController.updateListing);

// Delete a listing (requires authentication and authorization)
router.delete('/:id', auth, listingController.deleteListing);

module.exports = router;
