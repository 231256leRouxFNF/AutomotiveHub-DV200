// autohub/backend/controllers/listingController.js

const Listing = require('../models/Listing');

const listingController = {
  // Create a new listing
  createListing: (req, res) => {
    const listingData = req.body;
    // Assuming userId is obtained from authenticated user
    listingData.userId = req.user.id; 

    Listing.create(listingData, (err, result) => {
      if (err) {
        console.error('Error creating listing:', err);
        return res.status(500).json({ success: false, message: 'Failed to create listing' });
      }
      res.status(201).json({ success: true, message: 'Listing created successfully', listingId: result.insertId });
    });
  },

  // Get all listings
  getAllListings: (req, res) => {
    const { q, category, condition, make, sort } = req.query;
    let sql = 'SELECT l.id, l.title, l.description, l.price, l.location, l.condition, l.make, l.model, l.year, l.imageUrls, u.username as owner_username, p.display_name as owner_name, l.created_at FROM listings l JOIN users u ON l.userId = u.id LEFT JOIN profiles p ON u.id = p.user_id';
    const params = [];
    const where = [];
    if (q) { where.push('(l.title LIKE ? OR l.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    if (category) { where.push('l.category = ?'); params.push(category); }
    if (condition) { where.push('l.condition = ?'); params.push(condition); }
    if (make) { where.push('l.make = ?'); params.push(make); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');

    // Ordering logic
    if (sort === 'price_asc') {
      sql += ' ORDER BY l.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY l.price DESC';
    } else {
      sql += ' ORDER BY l.created_at DESC';
    }
    
    Listing.query(sql, params, (err, listings) => {
      if (err) {
        console.error('Error fetching all listings:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch all listings' });
      }
      res.status(200).json(listings);
    });
  },

  // Get listings by userId
  getListingsByUserId: (req, res) => {
    const { userId } = req.query; // Assuming userId is passed as a query parameter
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    Listing.findByUserId(userId, (err, listings) => {
      if (err) {
        console.error('Error fetching user listings:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch user listings' });
      }
      res.status(200).json(listings);
    });
  },

  // Get a single listing by ID
  getListingById: (req, res) => {
    const { id } = req.params;
    Listing.findById(id, (err, listing) => {
      if (err) {
        console.error('Error fetching listing:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch listing' });
      }
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }
      res.status(200).json(listing);
    });
  },

  // Update a listing
  updateListing: (req, res) => {
    const { id } = req.params;
    const listingData = req.body;

    Listing.update(id, listingData, (err, result) => {
      if (err) {
        console.error('Error updating listing:', err);
        return res.status(500).json({ success: false, message: 'Failed to update listing' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Listing not found or no changes made' });
      }
      res.status(200).json({ success: true, message: 'Listing updated successfully' });
    });
  },

  // Delete a listing
  deleteListing: (req, res) => {
    const { id } = req.params;

    Listing.delete(id, (err, result) => {
      if (err) {
        console.error('Error deleting listing:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete listing' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }
      res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    });
  },
};

module.exports = listingController;
