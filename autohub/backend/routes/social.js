
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const user_id = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO posts (user_id, content, image_url, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, content, image_url || null]
    );

    const [newPost] = await db.execute(
      `SELECT p.*, u.username, u.profile_image 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.json({ 
      success: true, 
      post: newPost[0],
      message: 'Post created successfully' 
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});
