// autohub/backend/routes/listingRoutes.js

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for listing images
const listingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

// ⭐ SPECIFIC ROUTES FIRST - /related must come BEFORE /:listingId
router.get('/:listingId/related', listingController.getRelatedListings);

// GENERIC ROUTES LAST - /:listingId comes after specific routes
router.get('/:listingId', listingController.getListingById);

// Create a new listing
router.post('/', auth, uploadListings.array('images', 10), listingController.createListing);

// Update a listing
router.put('/:listingId', auth, listingController.updateListing);

// Delete a listing
router.delete('/:listingId', auth, listingController.deleteListing);

module.exports = router;
