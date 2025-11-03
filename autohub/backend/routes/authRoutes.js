const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Logout route
router.post('/logout', authController.logout);

module.exports = router;