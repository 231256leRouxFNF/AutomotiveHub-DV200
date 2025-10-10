const db = require('../config/db');

const Follow = {};

Follow.create = (followerId, followeeId, callback) => {
  const query = 'INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)';
  db.query(query, [followerId, followeeId], (err, result) => {
    if (err) {
      console.error('Error creating follow:', err);
      return callback(err);
    }
    callback(null, result.insertId);
  });
};

Follow.delete = (followerId, followeeId, callback) => {
  const query = 'DELETE FROM follows WHERE follower_id = ? AND followee_id = ?';
  db.query(query, [followerId, followeeId], (err, result) => {
    if (err) {
      console.error('Error deleting follow:', err);
      return callback(err);
    }
    callback(null, result.affectedRows > 0);
  });
};

Follow.isFollowing = (followerId, followeeId, callback) => {
  const query = 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?';
  db.query(query, [followerId, followeeId], (err, results) => {
    if (err) {
      console.error('Error checking follow status:', err);
      return callback(err);
    }
    callback(null, results[0].count > 0);
  });
};

Follow.getFollowers = (userId, callback) => {
  const query = 'SELECT f.follower_id, u.username, p.display_name, p.avatar_url FROM follows f JOIN users u ON f.follower_id = u.id LEFT JOIN profiles p ON u.id = p.user_id WHERE f.followee_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching followers:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

Follow.getFollowing = (userId, callback) => {
  const query = 'SELECT f.followee_id, u.username, p.display_name, p.avatar_url FROM follows f JOIN users u ON f.followee_id = u.id LEFT JOIN profiles p ON u.id = p.user_id WHERE f.follower_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching following:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

module.exports = Follow;
