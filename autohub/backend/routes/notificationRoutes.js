const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth'); // Destructure auth middleware

// Get all notifications for a user
router.get('/', auth, notificationController.getNotifications);

// Get unread notifications count for a user
router.get('/unread-count', auth, notificationController.getUnreadNotificationsCount);

// Mark a notification as read
router.put('/:id/read', auth, notificationController.markNotificationAsRead);

// Delete a notification
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
