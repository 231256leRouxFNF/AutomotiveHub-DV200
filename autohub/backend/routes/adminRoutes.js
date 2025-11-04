const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  console.log('🔍 Admin check - req.user:', req.user);
  console.log('🔍 Admin check - req.user.role:', req.user?.role);
  if (!req.user || req.user.role !== 'admin') {
    console.log('❌ Admin access denied');
    return res.status(403).json({ message: 'Admin access required' });
  }
  console.log('✅ Admin access granted');
  next();
};

// Bulk delete users (admin only)
router.post('/users/bulk-delete', protect, requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }
    // Prevent deleting yourself
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    const [result] = await db.promise().query(
      `DELETE FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    );
    res.json({ success: true, message: `Deleted ${result.affectedRows} users` });
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk delete users' });
  }
});
// Bulk delete posts (admin only)
router.post('/posts/bulk-delete', protect, requireAdmin, async (req, res) => {
  try {
    const { postIds } = req.body;
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No post IDs provided' });
    }
    const [result] = await db.promise().query(
      `DELETE FROM posts WHERE id IN (${postIds.map(() => '?').join(',')})`,
      postIds
    );
    res.json({ success: true, message: `Deleted ${result.affectedRows} posts` });
  } catch (error) {
    console.error('Error bulk deleting posts:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk delete posts' });
  }
});

// Middleware to check if user is admin

// Get all users (admin only)
router.get('/users', protect, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', protect, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    // Delete user (cascade will delete their posts, vehicles, etc.)
    await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// Get all posts (admin only)
router.get('/posts', protect, requireAdmin, async (req, res) => {
  try {
    const [posts] = await db.promise().query(
      `SELECT 
        p.*,
        u.username,
        u.email
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      ORDER BY p.created_at DESC`
    );
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

module.exports = router;
// Delete post (admin only)
router.delete('/posts/:postId', protect, requireAdmin, async (req, res) => {
  try {
    const { postId } = req.params;
    const [result] = await db.promise().query('DELETE FROM posts WHERE id = ?', [postId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});
