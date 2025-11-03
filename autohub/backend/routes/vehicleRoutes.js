const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Simple auth middleware check
const protect = (req, res, next) => {
  // If you have auth middleware, uncomment this:
  // const auth = require('../middleware/auth');
  // return auth.protect(req, res, next);
  
  // For now, just pass through (remove this when auth is ready)
  req.user = { id: 1 }; // Mock user
  next();
};

// Get all vehicles
router.get('/', (req, res) => {
  db.query('SELECT * FROM vehicles ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get vehicle by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(results[0]);
  });
});

// Delete vehicle
router.delete('/:id', protect, (req, res) => {
  db.query('DELETE FROM vehicles WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  });
});

module.exports = router;