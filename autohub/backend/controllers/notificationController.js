const Notification = require('../models/Notification');

const notificationController = {
  getNotifications: (req, res) => {
    const userId = req.userId; // Assuming userId is set by auth middleware
    Notification.findByUserId(userId, (err, notifications) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching notifications', error: err });
      }
      res.json(notifications);
    });
  },

  markNotificationAsRead: (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Assuming userId is set by auth middleware

    // Optional: Verify ownership of the notification before marking as read
    // You might want to fetch the notification first to check userId

    Notification.markAsRead(id, (err, success) => {
      if (err) {
        return res.status(500).json({ message: 'Error marking notification as read', error: err });
      }
      if (!success) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json({ message: 'Notification marked as read' });
    });
  },

  getUnreadNotificationsCount: (req, res) => {
    const userId = req.userId; // Assuming userId is set by auth middleware
    Notification.getUnreadCount(userId, (err, count) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching unread count', error: err });
      }
      res.json({ count });
    });
  },

  deleteNotification: (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Assuming userId is set by auth middleware

    // Optional: Verify ownership of the notification before deleting

    Notification.delete(id, (err, success) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting notification', error: err });
      }
      if (!success) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json({ message: 'Notification deleted' });
    });
  },
};

module.exports = notificationController;
