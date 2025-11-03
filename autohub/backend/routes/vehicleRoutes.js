const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Get all vehicles for the logged-in user
const getUserVehicles = (req, res) => {
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
};

// Add a new vehicle
const addVehicle = async (req, res) => {
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
};

// Delete a vehicle
const deleteVehicle = (req, res) => {
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
};

// Get all vehicles
const getVehicles = async (req, res) => {
  try {
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles ORDER BY created_at DESC'
    );
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles WHERE id = ?',
      [req.params.id]
    );
    
    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicles[0]);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create vehicle
const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    
    const [result] = await db.query(
      'INSERT INTO vehicles SET ?',
      vehicleData
    );
    
    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicleId: result.insertId
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE vehicles SET ? WHERE id = ?',
      [req.body, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search vehicles
const searchVehicles = async (req, res) => {
  try {
    const { query } = req.query;
    
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles WHERE make LIKE ? OR model LIKE ? OR description LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    
    res.json(vehicles);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Routes
router.get('/', protect, getUserVehicles);
router.get('/all', getVehicles);
router.get('/search', searchVehicles);
router.get('/:id', getVehicleById);
router.post('/', protect, addVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;