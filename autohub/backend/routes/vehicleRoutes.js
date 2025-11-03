const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// Get all vehicles for logged-in user
router.get('/', protect, (req, res) => {
  const userId = req.user.id;
  
  db.query('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching vehicles:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Vehicles fetched:', results);
    res.json(results);
  });
});

// Get vehicle by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching vehicle:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(results[0]);
  });
});

// Delete vehicle
router.delete('/:id', protect, (req, res) => {
  const vehicleId = req.params.id;
  const userId = req.user.id;
  
  console.log('Attempting to delete vehicle:', vehicleId, 'for user:', userId);
  
  db.query('DELETE FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log('Delete result:', result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  });
});

module.exports = router;