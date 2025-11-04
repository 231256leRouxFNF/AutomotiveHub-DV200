const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET all posts
router.get('/posts', async (req, res) => {
  try {
    const [posts] = await db.execute(
      `SELECT 
        p.*,
        u.username,
        u.profile_image as user_profile_image,
        COUNT(DISTINCT l.id) as likes,
        COUNT(DISTINCT c.id) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.userId = u.id
      LEFT JOIN post_likes l ON p.id = l.post_id
      LEFT JOIN post_comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC`
    );

    console.log('📤 Sending posts:', posts.length);
    res.json({ success: true, posts: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// POST create new post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const user_id = req.user.id;

    console.log('📥 Creating post:', { user_id, content, image_url });
    console.log('🔐 User from token:', req.user);

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    console.log('💾 Attempting database insert...');
    
    // Use userId instead of user_id to match your table
    const [result] = await db.execute(
      'INSERT INTO posts (userId, content, image_url, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, content, image_url || null]
    );

    console.log('✅ Post created with ID:', result.insertId);

    // Fetch the complete post with user data
    const [newPost] = await db.execute(
      `SELECT 
        p.*,
        u.username,
        u.profile_image as user_profile_image
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.json({ 
      success: true, 
      post: newPost[0],
      message: 'Post created successfully' 
    });
  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌ ERROR CREATING POST');
    console.error('❌ ========================================');
    console.error('❌ Error object:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ SQL Message:', error.sqlMessage);
    console.error('❌ ========================================');
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create post',
      error: error.message,
      details: error.sqlMessage || error.code || 'Database error'
    });
  }
});

// POST like a post
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const [existing] = await db.execute(
      'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existing.length > 0) {
      // Unlike
      await db.execute(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      res.json({ success: true, action: 'unliked' });
    } else {
      // Like
      await db.execute(
        'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      res.json({ success: true, action: 'liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
});

module.exports = router;
