// autohub/backend/controllers/listingController.js

const Listing = require('../models/Listing');

const listingController = {
  // Create a new listing
  createListing: (req, res) => {
    const { title, description, price, category, condition, year, make, model, mileage, location } = req.body;
    const userId = req.userId; // userId from auth middleware

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    const newListing = {
      userId,
      title,
      description,
      price,
      category,
      condition,
      year,
      make,
      model,
      mileage,
      location,
      imageUrls: JSON.stringify(imageUrls), // Store as JSON string
    };

    Listing.create(newListing, (err, result) => {
      if (err) {
        console.error('Error creating listing:', err);
        return res.status(500).json({ success: false, message: 'Failed to create listing' });
      }
      res.status(201).json({ success: true, message: 'Listing created successfully', listingId: result.insertId });
    });
  },

  // Get all listings
  getAllListings: async (req, res) => {
    const { q, category, condition, make, sort, minPrice, maxPrice, limit, offset } = req.query;
    let sql = 'SELECT l.id, l.title, l.description, l.price, l.location, l.condition, l.make, l.model, l.year, l.imageUrls, u.username as owner_username, p.display_name as owner_name, l.created_at FROM listings l JOIN users u ON l.userId = u.id LEFT JOIN profiles p ON u.id = p.user_id';
    let countSql = 'SELECT COUNT(*) as totalCount FROM listings l JOIN users u ON l.userId = u.id LEFT JOIN profiles p ON u.id = p.user_id';
    const params = [];
    const where = [];

    if (q) { where.push('(l.title LIKE ? OR l.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    if (category) { where.push('l.category = ?'); params.push(category); }
    if (condition) { where.push('l.condition = ?'); params.push(condition); }
    if (make) { where.push('l.make = ?'); params.push(make); }
    if (minPrice) { where.push('l.price >= ?'); params.push(minPrice); }
    if (maxPrice) { where.push('l.price <= ?'); params.push(maxPrice); }

    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
      countSql += ' WHERE ' + where.join(' AND ');
    }

    // Ordering logic
    if (sort === 'price_asc') {
      sql += ' ORDER BY l.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY l.price DESC';
    } else if (sort === 'created_at_desc') {
      sql += ' ORDER BY l.created_at DESC';
    } else {
      sql += ' ORDER BY l.created_at DESC'; // Default sort
    }

    // Add pagination
    const parsedLimit = parseInt(limit) || 10; // Default limit to 10
    const parsedOffset = parseInt(offset) || 0; // Default offset to 0
    sql += ` LIMIT ${parsedLimit} OFFSET ${parsedOffset}`;
    
    try {
      const [listings] = await Listing.query(sql, params);
      const [totalCountResult] = await Listing.query(countSql, params);
      const totalCount = totalCountResult[0].totalCount;
      
      res.status(200).json({ 
        totalCount,
        limit: parsedLimit,
        offset: parsedOffset,
        listings
      });
    } catch (err) {
      console.error('Error fetching all listings:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch all listings' });
    }
  },

  // Get listings by userId
  getListingsByUserId: (req, res) => {
    const { userId } = req.params; // Get userId from URL parameters
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
    const { title, description, price, category, condition, year, make, model, mileage, location } = req.body;
    const userId = req.userId; // userId from auth middleware

    if (!userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.existingImageUrls) {
      // If no new files, but existingImageUrls are provided, parse them
      imageUrls = JSON.parse(req.body.existingImageUrls);
    }

    const updatedListing = {
      userId, // Ensure the correct user is updating the listing
      title,
      description,
      price,
      category,
      condition,
      year,
      make,
      model,
      mileage,
      location,
      imageUrls: JSON.stringify(imageUrls), // Store as JSON string
    };

    Listing.update(id, updatedListing, (err, result) => {
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
