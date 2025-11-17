require('dotenv').config();


// ============ LOAD ENVIRONMENT VARIABLES FIRST ============
const path = require('path');

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// NOW check JWT_SECRET after dotenv is loaded
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in .env file!');
  console.error('Create a .env file in the backend folder with: JWT_SECRET=your_secret_key_here');
  process.exit(1);
}


const multer = require('multer');
const fs = require('fs');

// Now import db AFTER environment is loaded
const db = require('./config/db');

// Import route files
const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ AUTHENTICATION MIDDLEWARE ============
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // CHANGED: Set both userId and user object
    req.userId = decoded.id || decoded.userId;
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username
    };
    
    // ...existing code...
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ API ROUTES MUST COME FIRST ============

// Auth routes - MUST be before any other /api/auth routes
app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// Mount routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);

// Test routes
app.get('/', (req, res) => {
  res.send('API is working');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ ok: 0, error: err.message });
    }
    res.json({ ok: 1, result: results[0].result });
  });
});

// Add this after your test-db route
app.get('/test-vehicles-table', async (req, res) => {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'vehicles'");
    if (tables.length === 0) {
      return res.json({ 
        exists: false, 
        message: 'vehicles table does not exist' 
      });
    }
    
    const [columns] = await db.query("DESCRIBE vehicles");
    res.json({ 
      exists: true, 
      columns: columns 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this debug endpoint
app.get('/test-events-table', async (req, res) => {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'events'");
    if (tables.length === 0) {
      return res.json({ 
        exists: false, 
        message: 'events table does not exist' 
      });
    }
    
    // Check if any events exist
    const [events] = await db.query("SELECT COUNT(*) as count FROM events");
    const [allEvents] = await db.query("SELECT * FROM events ORDER BY created_at DESC LIMIT 5");
    
    res.json({ 
      exists: true,
      eventCount: events[0].count,
      recentEvents: allEvents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ REGISTER ROUTE ============
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    // Validates the input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }

    // Checks if user already exists
    const checkUserSql = 'SELECT * FROM users WHERE email = ? OR username = ?';
    const [existingUsers] = await db.query(checkUserSql, [email, username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Hashes the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserts user(s) to db
    const insertUserSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const [result] = await db.query(insertUserSql, [username, email, hashedPassword]);

    const userId = result.insertId;

    // Creates account
    const insertProfileSql = 'INSERT INTO profiles (user_id, display_name) VALUES (?, ?)';
    await db.query(insertProfileSql, [userId, display_name || username]);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        display_name: display_name || username
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register user',
      error: error.message 
    });
  }
});

// ============ USER PROFILE ENDPOINTS ============
// Public profile endpoint for any user by ID
app.get('/api/user/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;
    const sql = 'SELECT id, username, email, created_at, profile_image FROM users WHERE id = ?';
    const [users] = await db.query(sql, [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return user object directly for frontend compatibility
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Failed to fetch public profile' });
  }
});

// Alias for frontend compatibility
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;
    const sql = 'SELECT id, username, email, created_at, profile_image FROM users WHERE id = ?';
    const [users] = await db.query(sql, [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Failed to fetch public profile' });
  }
});

app.get('/api/user/profile', auth, async (req, res) => {
  try {
  const sql = 'SELECT id, username, email, created_at, profile_image FROM users WHERE id = ?';
    const [users] = await db.query(sql, [req.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const { display_name, email } = req.body;
    
    if (!display_name && !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field must be provided' 
      });
    }

    const sql = 'UPDATE users SET display_name = ?, email = ? WHERE id = ?';
    await db.query(sql, [display_name, email, req.userId]);
    
    // Get updated user
    const [users] = await db.query(
      'SELECT id, username, email, display_name, avatar_url FROM users WHERE id = ?', 
      [req.userId]
    );
    
    // Update localStorage
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

app.post('/api/user/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Upload to Cloudinary
    const cloudinary = require('./config/cloudinary');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'autohub/profile_pics',
      public_id: `user_${req.userId}_${Date.now()}`,
      resource_type: 'image'
    });

    // Save Cloudinary URL to profile_image column
    const profileImageUrl = result.secure_url;
    const sql = 'UPDATE users SET profile_image = ? WHERE id = ?';
    await db.query(sql, [profileImageUrl, req.userId]);

    // Optionally, delete local file after upload
    const fs = require('fs');
    fs.unlink(req.file.path, () => {});

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      profile_image: profileImageUrl
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile image' });
  }
});

app.put('/api/user/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both current and new password are required' 
      });
    }

    // Verify current password
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.userId]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// ============ LISTINGS (MARKETPLACE) ENDPOINTS ============

app.get('/api/listings', async (req, res) => {
  try {
    const sql = `
      SELECT l.*, u.username
      FROM listings l
      JOIN users u ON l.userId = u.id
      ORDER BY l.created_at DESC
    `;
    const [listings] = await db.query(sql);
    res.json({ success: true, listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT l.*, u.username, u.email
      FROM listings l
      JOIN users u ON l.userId = u.id
      WHERE l.id = ?
    `;
    const [listings] = await db.query(sql, [id]);
    
    if (listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    res.json({ success: true, listing: listings[0] });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch listing' });
  }
});

app.post('/api/listings', auth, async (req, res) => {
  try {
    const { title, description, price, category, condition, year, make, model, mileage, location, imageUrls } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, price, and category are required' 
      });
    }

    const sql = `
      INSERT INTO listings (userId, title, description, price, category, \`condition\`, year, make, model, mileage, location, imageUrls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      req.userId,
      title,
      description || '',
      price,
      category,
      condition || 'used',
      year || null,
      make || '',
      model || '',
      mileage || 0,
      location || '',
      imageUrls || '[]'
    ]);

    res.json({ 
      success: true, 
      message: 'Listing created successfully',
      listingId: result.insertId
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ success: false, message: 'Failed to create listing' });
  }
});

app.put('/api/listings/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, condition, images } = req.body;

    // Check ownership
    const [listings] = await db.query('SELECT * FROM listings WHERE id = ? AND userId = ?', [id, req.userId]);
    
    if (listings.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit your own listings' 
      });
    }

    const sql = `
      UPDATE listings 
      SET title = ?, description = ?, price = ?, category = ?, \`condition\` = ?, images = ?
      WHERE id = ?
    `;
    
    await db.query(sql, [
      title, 
      description, 
      price, 
      category, 
      condition,
      JSON.stringify(images || []),
      id
    ]);

    res.json({ success: true, message: 'Listing updated successfully' });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ success: false, message: 'Failed to update listing' });
  }
});

app.delete('/api/listings/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const [listings] = await db.query('SELECT * FROM listings WHERE id = ? AND userId = ?', [id, req.userId]);
    
    if (listings.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own listings' 
      });
    }

    await db.query('DELETE FROM listings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({ success: false, message: 'Failed to search listings' });
  }
});

// ============ CREATE EVENT ============
app.post('/api/events', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, date, location } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, date, and location are required' 
      });
    }

    const sql = `
      INSERT INTO events (userId, title, description, date, location)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      userId, title, description, date, location
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Event created successfully',
      eventId: result.insertId 
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// ============ GET ALL EVENTS (UPDATED WITH LOGGING) ============
app.get('/api/events', async (req, res) => {
  try {
    // ...existing code...
    
    const sql = `
      SELECT e.*, u.username, p.display_name
      FROM events e
      JOIN users u ON e.userId = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY e.date ASC
      LIMIT 50
    `;
    
    const [events] = await db.query(sql);
    // ...existing code...
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// ============ ADD VEHICLE TO GARAGE (WITH IMAGE UPLOAD) ============

// Update GET garage endpoint to include image URLs
app.get('/api/garage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const sql = `
      SELECT id, user_id, make, model, year, color, description, 
             mileage, vin, nickname, image_url, created_at
      FROM vehicles 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    const [vehicles] = await db.query(sql, [userId]);
    
    console.log(` Found ${vehicles.length} vehicles for user ${userId}`);
    
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error(' Garage error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch garage' });
  }
});

// ============ GET UNREAD NOTIFICATIONS COUNT ============
app.get('/api/notifications/unread-count', auth, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE';
    const [result] = await db.query(sql, [userId]);
    
    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error('Notifications error:', error);
    res.json({ success: true, count: 0 }); // Return 0 on error
  }
});

// ============ POSTS ENDPOINTS ============

// Get all posts - Place this BEFORE the POST route
app.get('/api/posts', async (req, res) => {
  try {
    console.log('📥 GET /api/posts - Fetching all posts');
    
    const [posts] = await db.query(
      `SELECT 
        p.*,
        u.username,
        u.email,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      LEFT JOIN post_likes pl ON p.id = pl.postId
      LEFT JOIN comments c ON p.id = c.postId
      GROUP BY p.id
      ORDER BY p.created_at DESC`
    );

    console.log(` Found ${posts.length} posts`);
    res.json({ success: true, posts });
  } catch (error) {
    console.error(' Error fetching posts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch posts',
      details: error.message 
    });
  }
});

// POST create new post - Place this AFTER the GET route
app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('📥 POST /api/posts - Creating new post');
    console.log('📥 Request body:', req.body);
    console.log('📥 User from auth:', req.user);
    
    const { content, image_url } = req.body;
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    // Insert the post
    const [result] = await db.query(
      'INSERT INTO posts (userId, content, image_url, created_at) VALUES (?, ?, ?, NOW())',
      [userId, content, image_url || null]
    );

    console.log(' Post created with ID:', result.insertId);

    // Fetch the complete post with user data
    const [newPost] = await db.query(
      `SELECT 
        p.*,
        u.username,
        u.email
      FROM posts p 
      JOIN users u ON p.userId = u.id 
      WHERE p.id = ?`,
      [result.insertId]
    );

    console.log('Returning post:', newPost[0]);

    res.status(201).json({ 
      success: true, 
      post: newPost[0],
      message: 'Post created successfully' 
    });
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create post',
      details: error.message
    });
  }
});

// Like/Unlike a post
app.post('/api/social/posts/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    // Check if already liked
    const checkSql = 'SELECT * FROM post_likes WHERE postId = ? AND userId = ?';
    const [existing] = await db.query(checkSql, [postId, userId]);

    if (existing.length > 0) {
      // Unlike
      await db.query('DELETE FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId]);
      res.json({ success: true, message: 'Post unliked', liked: false });
    } else {
      // Like
      await db.query('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [postId, userId]);
      res.json({ success: true, message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
});

// Add comment to post
app.post('/api/social/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }

    const sql = 'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [postId, userId, content]);

    // Fetch the created comment with user info
    const getCommentSql = `
      SELECT c.*, u.username, u.display_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    const [comments] = await db.query(getCommentSql, [result.insertId]);

    res.json({ 
      success: true, 
      message: 'Comment added',
      comment: comments[0]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// Delete post
app.delete('/api/social/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    // Check if user owns the post
    const checkSql = 'SELECT * FROM posts WHERE id = ? AND userId = ?';
    const [posts] = await db.query(checkSql, [postId, userId]);

    if (posts.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own posts' 
      });
    }

    // Delete post (cascade will delete likes and comments)
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// ============ DELETE VEHICLE FROM GARAGE ============
app.delete('/api/garage/vehicles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('🗑️ Delete vehicle request:', { id, userId });

    // Check if vehicle exists and belongs to the user
    const checkSql = 'SELECT * FROM vehicles WHERE id = ? AND user_id = ?';
    const [vehicles] = await db.query(checkSql, [id, userId]);

    if (vehicles.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vehicle not found or you do not have permission to delete it' 
      });
    }

    // Delete the vehicle's image file if it exists
    const vehicle = vehicles[0];
    if (vehicle.image_url) {
      const imagePath = path.join(__dirname, vehicle.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(' Deleted image file:', imagePath);
      }
    }

    // Delete vehicle from database
    await db.query('DELETE FROM vehicles WHERE id = ?', [id]);

    console.log(' Vehicle deleted successfully');

    res.json({ 
      success: true, 
      message: 'Vehicle deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
