const Listing = require('../models/Listing');
const cloudinary = require('../config/cloudinary');

const listingController = {
  // Create a new listing
  createListing: async (req, res) => {
    try {
      const { title, description, price, make, model, year, userId } = req.body;
      
      // Upload images to Cloudinary
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'autohub/listings',
            resource_type: 'auto'
          });
          imageUrls.push(result.secure_url);
        }
      }

      // Insert listing into database with Cloudinary URLs
      const query = `
        INSERT INTO listings (title, description, price, make, model, year, userId, images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        title, 
        description, 
        price, 
        make, 
        model, 
        year, 
        userId,
        JSON.stringify(imageUrls) // Store as JSON array
      ]);

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        listingId: result.insertId,
        images: imageUrls
      });

    } catch (error) {
      console.error('Error creating listing:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating listing',
        error: error.message 
      });
    }
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
  deleteListing: async (req, res) => {
    try {
      const { listingId } = req.params;

      // Get listing images first
      const [listing] = await db.execute(
        'SELECT images FROM listings WHERE id = ?',
        [listingId]
      );

      // Delete images from Cloudinary
      if (listing[0]?.images) {
        const images = JSON.parse(listing[0].images);
        for (const imageUrl of images) {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(`autohub/listings/${publicId}`);
        }
      }

      // Delete listing from database
      await db.execute('DELETE FROM listings WHERE id = ?', [listingId]);

      res.json({ success: true, message: 'Listing deleted successfully' });

    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting listing',
        error: error.message 
      });
    }
  },

  // Get related listings
  getRelatedListings: (req, res) => {
    const { listingId } = req.params;
    
    // First get the current listing to find similar ones
    Listing.findById(listingId, (err, listing) => {
      if (err) {
        console.error('Error fetching listing:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch listing' });
      }
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      // Find related listings by same make or category
      const sql = `
        SELECT l.*, u.username as owner_username 
        FROM listings l 
        JOIN users u ON l.userId = u.id 
        WHERE l.id != ? 
        AND (l.make = ? OR l.category = ?) 
        ORDER BY l.created_at DESC 
        LIMIT 6
      `;
      
      Listing.query(sql, [listingId, listing.make, listing.category])
        .then(([results]) => {
          res.status(200).json(results);
        })
        .catch(error => {
          console.error('Error fetching related listings:', error);
          res.status(500).json({ success: false, message: 'Failed to fetch related listings' });
        });
    });
  },
};

module.exports = listingController;
