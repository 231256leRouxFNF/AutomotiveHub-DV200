const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
// const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// Get all notifications for a user
router.get('/', notificationController.getNotifications);

// Get unread notifications count for a user
router.get('/unread-count', notificationController.getUnreadNotificationsCount);

// Mark a notification as read
router.put('/:id/read', notificationController.markNotificationAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
