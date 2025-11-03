const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Get all vehicles for the logged-in user
router.get('/', protect, (req, res) => {
  const userId = req.user.id;
  console.log('Fetching vehicles for user:', userId);

  const query = 'SELECT * FROM vehicles WHERE user_id = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching vehicles:', err);
      return res.status(500).json({ message: 'Error fetching vehicles', error: err.message });
    }
    console.log('Vehicles found:', results.length);
    res.json(results);
  });
});

// Get all vehicles (public)
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM vehicles ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all vehicles:', err);
      return res.status(500).json({ message: 'Error fetching vehicles', error: err.message });
    }
    res.json(results);
  });
});

// Search vehicles
router.get('/search', (req, res) => {
  const searchQuery = req.query.query || '';
  const query = 'SELECT * FROM vehicles WHERE make LIKE ? OR model LIKE ? OR description LIKE ?';
  const searchPattern = `%${searchQuery}%`;
  
  db.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
    if (err) {
      console.error('Error searching vehicles:', err);
      return res.status(500).json({ message: 'Error searching vehicles', error: err.message });
    }
    res.json(results);
  });
});

// Get vehicle by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM vehicles WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching vehicle:', err);
      return res.status(500).json({ message: 'Error fetching vehicle', error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(results[0]);
  });
});

// Add a new vehicle
router.post('/', protect, async (req, res) => {
  try {
    const { make, model, year, color, description } = req.body;
    const userId = req.user.id;
    let imageUrl = null;

    console.log('Adding vehicle for user:', userId);

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'autohub_vehicles'
      });
      imageUrl = result.secure_url;
      console.log('Image uploaded to Cloudinary:', imageUrl);
    }

    const query = 'INSERT INTO vehicles (user_id, make, model, year, color, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [userId, make, model, year, color, description, imageUrl], (err, result) => {
      if (err) {
        console.error('Error adding vehicle:', err);
        return res.status(500).json({ message: 'Error adding vehicle', error: err.message });
      }
      
      res.status(201).json({
        message: 'Vehicle added successfully',
        vehicleId: result.insertId,
        imageUrl
      });
    });
  } catch (error) {
    console.error('Error in addVehicle:', error);
    res.status(500).json({ message: 'Error adding vehicle', error: error.message });
  }
});

// Update vehicle
router.put('/:id', protect, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const { make, model, year, color, description } = req.body;
    let imageUrl = null;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'autohub_vehicles'
      });
      imageUrl = result.secure_url;
    }

    const updateFields = [];
    const updateValues = [];

    if (make) { updateFields.push('make = ?'); updateValues.push(make); }
    if (model) { updateFields.push('model = ?'); updateValues.push(model); }
    if (year) { updateFields.push('year = ?'); updateValues.push(year); }
    if (color) { updateFields.push('color = ?'); updateValues.push(color); }
    if (description) { updateFields.push('description = ?'); updateValues.push(description); }
    if (imageUrl) { updateFields.push('image_url = ?'); updateValues.push(imageUrl); }

    updateValues.push(vehicleId, userId);

    const query = `UPDATE vehicles SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
    
    db.query(query, updateValues, (err, result) => {
      if (err) {
        console.error('Error updating vehicle:', err);
        return res.status(500).json({ message: 'Error updating vehicle', error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
      }
      
      res.json({ message: 'Vehicle updated successfully', imageUrl });
    });
  } catch (error) {
    console.error('Error in updateVehicle:', error);
    res.status(500).json({ message: 'Error updating vehicle', error: error.message });
  }
});

// Delete a vehicle
router.delete('/:id', protect, (req, res) => {
  const vehicleId = req.params.id;
  const userId = req.user.id;
  const query = 'DELETE FROM vehicles WHERE id = ? AND user_id = ?';
  
  db.query(query, [vehicleId, userId], (err, result) => {
    if (err) {
      console.error('Error deleting vehicle:', err);
      return res.status(500).json({ message: 'Error deleting vehicle', error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  });
});

module.exports = router;