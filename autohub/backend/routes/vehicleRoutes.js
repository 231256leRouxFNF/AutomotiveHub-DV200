const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Import auth middleware with error checking
let protect;
try {
  const auth = require('../middleware/auth');
  protect = auth.protect;
  if (typeof protect !== 'function') {
    console.error('⚠️ Warning: protect middleware is not a function');
    protect = (req, res, next) => {
      console.log('Using fallback auth middleware');
      req.user = { id: 1 }; // Fallback for development
      next();
    };
  }
} catch (error) {
  console.error('❌ Failed to load auth middleware:', error.message);
  protect = (req, res, next) => {
    req.user = { id: 1 }; // Fallback for development
    next();
  };
}

console.log('✅ Vehicle routes loaded, protect is:', typeof protect);

// Get all vehicles for logged-in user
router.get('/', protect, (req, res) => {
  const userId = req.user.id;
  console.log('📥 Fetching vehicles for user:', userId);

  db.query('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching vehicles:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Found vehicles:', results.length);
    res.json(results);
  });
});

// Get all vehicles (public)
router.get('/all', (req, res) => {
  console.log('📥 Fetching all vehicles');
  
  db.query('SELECT * FROM vehicles ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('❌ Error fetching all vehicles:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Found all vehicles:', results.length);
    res.json(results);
  });
});

// Search vehicles
router.get('/search', (req, res) => {
  const searchQuery = req.query.query || '';
  console.log('🔍 Searching vehicles:', searchQuery);
  
  const query = 'SELECT * FROM vehicles WHERE make LIKE ? OR model LIKE ? OR description LIKE ?';
  const searchPattern = `%${searchQuery}%`;
  
  db.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
    if (err) {
      console.error('❌ Error searching vehicles:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Search results:', results.length);
    res.json(results);
  });
});

// Get vehicles for specific user (public route for viewing other users' garages)
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log('📥 Fetching vehicles for user:', userId);
  
  db.query('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching user vehicles:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Found vehicles for user', userId, ':', results.length);
    res.json(results);
  });
});

// Get vehicle by ID
router.get('/:id', (req, res) => {
  console.log('📥 Fetching vehicle:', req.params.id);
  
  db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching vehicle:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    console.log('✅ Vehicle found');
    res.json(results[0]);
  });
});

// Add new vehicle
router.post('/', protect, (req, res) => {
  const userId = req.user.id;
  const { make, model, year, color, description, image_url } = req.body;
  
  console.log('➕ Adding vehicle for user:', userId);

  const query = 'INSERT INTO vehicles (user_id, make, model, year, color, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [userId, make, model, year, color, description, image_url], (err, result) => {
    if (err) {
      console.error('❌ Error adding vehicle:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('✅ Vehicle added:', result.insertId);
    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicleId: result.insertId
    });
  });
});

// Update vehicle
router.put('/:id', protect, (req, res) => {
  const vehicleId = req.params.id;
  const userId = req.user.id;
  const { make, model, year, color, description, image_url } = req.body;
  
  console.log('✏️ Updating vehicle:', vehicleId);

  const query = 'UPDATE vehicles SET make = ?, model = ?, year = ?, color = ?, description = ?, image_url = ? WHERE id = ? AND user_id = ?';
  
  db.query(query, [make, model, year, color, description, image_url, vehicleId, userId], (err, result) => {
    if (err) {
      console.error('❌ Error updating vehicle:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }
    console.log('✅ Vehicle updated');
    res.json({ message: 'Vehicle updated successfully' });
  });
});

// Delete vehicle
router.delete('/:id', protect, (req, res) => {
  const vehicleId = req.params.id;
  const userId = req.user.id;
  
  console.log('🗑️ Deleting vehicle:', vehicleId, 'for user:', userId);
  
  db.query('DELETE FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId], (err, result) => {
    if (err) {
      console.error('❌ Delete error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log('🗑️ Delete result:', result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }
    
    console.log('✅ Vehicle deleted successfully');
    res.json({ message: 'Vehicle deleted successfully' });
  });
});

module.exports = router;