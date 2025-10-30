const db = require('../config/db');

const Notification = {};

Notification.create = (notificationData, callback) => {
  const { userId, type, message, link, isRead } = notificationData;
  const query = 'INSERT INTO notifications (userId, type, message, link, isRead) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [userId, type, message, link, isRead], (err, result) => {
    if (err) {
      console.error('Error creating notification:', err);
      return callback(err);
    }
    callback(null, { id: result.insertId, ...notificationData });
  });
};

Notification.findByUserId = (userId, callback) => {
  const query = 'SELECT * FROM notifications WHERE userId = ? ORDER BY created_at DESC';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

Notification.markAsRead = (notificationId, callback) => {
  const query = 'UPDATE notifications SET isRead = TRUE WHERE id = ?';
  db.query(query, [notificationId], (err, result) => {
    if (err) {
      console.error('Error marking notification as read:', err);
      return callback(err);
    }
    callback(null, result.affectedRows > 0);
  });
};

Notification.getUnreadCount = (userId, callback) => {
  const query = 'SELECT COUNT(*) AS count FROM notifications WHERE userId = ? AND isRead = FALSE';
  db.promise().query(query, [userId])
    .then(([results]) => {
      callback(null, results[0].count);
    })
    .catch(err => {
      console.error('Error fetching unread notification count:', err);
      callback(err);
    });
};

Notification.delete = (notificationId, callback) => {
    const query = 'DELETE FROM notifications WHERE id = ?';
    db.query(query, [notificationId], (err, result) => {
      if (err) {
        console.error('Error deleting notification:', err);
        return callback(err);
      }
      callback(null, result.affectedRows > 0);
    });
  };

module.exports = Notification;
