const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUserVehicles, addVehicle, deleteVehicle } = require('../controllers/vehicleController');
const authenticateToken = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(authenticateToken);

// Get all vehicles for the logged-in user
router.get('/', getUserVehicles);

// Add a new vehicle (with image upload)
router.post('/', upload.single('image'), addVehicle);

// Delete a vehicle
router.delete('/:id', deleteVehicle);

module.exports = router;