console.log('🚀 SERVER.JS STARTED - Line 1');

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ALWAYS load environment variables first
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('✓ Dotenv loaded');

// Now import db AFTER environment is loaded
const db = require('./config/db');
console.log('✓ DB loaded');

const app = express();

app.use(cors());
app.use(express.json());

// ============ API ROUTES MUST COME FIRST ============

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
    const [tables] = await db.promise().query("SHOW TABLES LIKE 'vehicles'");
    if (tables.length === 0) {
      return res.json({ 
        exists: false, 
        message: 'vehicles table does not exist' 
      });
    }
    
    const [columns] = await db.promise().query("DESCRIBE vehicles");
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
    const [tables] = await db.promise().query("SHOW TABLES LIKE 'events'");
    if (tables.length === 0) {
      return res.json({ 
        exists: false, 
        message: 'events table does not exist' 
      });
    }
    
    // Check if any events exist
    const [events] = await db.promise().query("SELECT COUNT(*) as count FROM events");
    const [allEvents] = await db.promise().query("SELECT * FROM events ORDER BY created_at DESC LIMIT 5");
    
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
    const [existingUsers] = await db.promise().query(checkUserSql, [email, username]);

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
    const [result] = await db.promise().query(insertUserSql, [username, email, hashedPassword]);

    const userId = result.insertId;

    // Creates account
    const insertProfileSql = 'INSERT INTO profiles (user_id, display_name) VALUES (?, ?)';
    await db.promise().query(insertProfileSql, [userId, display_name || username]);

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

// ============ LOGIN ROUTE ============
app.post('/api/login', async (req, res) => {
  try {
    console.log('📥 Login request body:', req.body);
    
    const { email, username, identifier, password } = req.body;
    
    // Supports email, username, or identifier field
    const loginField = identifier || email || username;

    // Validate input
    if (!loginField || !password) {
      console.log('❌ Missing fields:', { loginField: !!loginField, password: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Email/username and password are required' 
      });
    }

    // Searchesfor user via email OR username
    const sql = 'SELECT * FROM users WHERE email = ? OR username = ?';
    const [users] = await db.promise().query(sql, [loginField, loginField]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/username or password' 
      });
    }

    const user = users[0];

    // Compares password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/username or password' 
      });
    }

    // Fetches user profile
    const profileSql = 'SELECT * FROM profiles WHERE user_id = ?';
    const [profiles] = await db.promise().query(profileSql, [user.id]);
    const profile = profiles[0] || {};

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: profile.display_name || user.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message 
    });
  }
});

// ============ AUTH MIDDLEWARE ============
const { auth } = require('./middleware/auth');

// ============ GET USER PROFILE ============
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const sql = `
      SELECT u.id, u.username, u.email, u.role,
             p.display_name, p.bio, p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `;
    
    const [users] = await db.promise().query(sql, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// ============ UPDATE USER PROFILE ============
app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { display_name, bio } = req.body;

    const sql = 'UPDATE profiles SET display_name = ?, bio = ? WHERE user_id = ?';
    await db.promise().query(sql, [display_name, bio, userId]);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ============ GET ALL LISTINGS ============
app.get('/api/listings', async (req, res) => {
  try {
    const sql = `
      SELECT l.*, u.username, p.display_name
      FROM listings l
      JOIN users u ON l.userId = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY l.created_at DESC
      LIMIT 50
    `;
    
    const [listings] = await db.promise().query(sql);
    res.json({ success: true, listings });
  } catch (error) {
    console.error('Listings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
});

// ============ CREATE LISTING ============
app.post('/api/listings', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, price, category, make, model, year } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and price are required' });
    }

    const sql = `
      INSERT INTO listings (userId, title, description, price, category, make, model, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.promise().query(sql, [
      userId, title, description, price, category, make, model, year
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Listing created successfully',
      listingId: result.insertId 
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ success: false, message: 'Failed to create listing' });
  }
});

// ============ SEARCH LISTINGS ============
app.get('/api/search', async (req, res) => {
  try {
    const { q, category, maxPrice } = req.query;
    
    let sql = `
      SELECT l.*, u.username
      FROM listings l
      JOIN users u ON l.userId = u.id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      sql += ' AND (l.title LIKE ? OR l.description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    if (category) {
      sql += ' AND l.category = ?';
      params.push(category);
    }

    if (maxPrice) {
      sql += ' AND l.price <= ?';
      params.push(maxPrice);
    }

    sql += ' ORDER BY l.created_at DESC LIMIT 50';

    const [listings] = await db.promise().query(sql, params);
    res.json({ success: true, listings });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// ============ GET SINGLE LISTING ============
app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT l.*, u.username, p.display_name, p.avatar_url
      FROM listings l
      JOIN users u ON l.userId = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE l.id = ?
    `;
    
    const [listings] = await db.promise().query(sql, [id]);

    if (listings.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found' 
      });
    }

    res.json({ success: true, listing: listings[0] });
  } catch (error) {
    console.error('Listing error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch listing' });
  }
});

// ============ DELETE LISTING ============
app.delete('/api/listings/:id', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Verify ownership
    const checkSql = 'SELECT * FROM listings WHERE id = ? AND userId = ?';
    const [listings] = await db.promise().query(checkSql, [id, userId]);

    if (listings.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Listing not found or unauthorized' 
      });
    }

    const deleteSql = 'DELETE FROM listings WHERE id = ?';
    await db.promise().query(deleteSql, [id]);

    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete listing' });
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
    
    const [result] = await db.promise().query(sql, [
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
    console.log('📥 Fetching events...');
    
    const sql = `
      SELECT e.*, u.username, p.display_name
      FROM events e
      JOIN users u ON e.userId = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY e.date ASC
      LIMIT 50
    `;
    
    const [events] = await db.promise().query(sql);
    console.log(`✅ Found ${events.length} events`);
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('❌ Events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `vehicle-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// ============ ADD VEHICLE TO GARAGE (WITH IMAGE UPLOAD) ============
app.post('/api/garage/vehicles', auth, upload.array('images', 10), async (req, res) => {
  try {
    const userId = req.userId; // From JWT auth middleware
    const { make, model, year, color, description, mileage, vin, nickname } = req.body;

    console.log('📥 Add vehicle request:', { userId, make, model, year });

    if (!make || !model || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Make, model, and year are required' 
      });
    }

    // Get image URL from uploaded file
    let imageUrl = null;
    if (req.files && req.files.length > 0) {
      // Use the first uploaded image
      imageUrl = `/uploads/${req.files[0].filename}`;
    }

    const sql = `
      INSERT INTO vehicles (user_id, make, model, year, color, description, mileage, vin, nickname, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.promise().query(sql, [
      userId, make, model, year, color, description, mileage, vin, nickname, imageUrl
    ]);

    console.log('✅ Vehicle added successfully:', result.insertId);

    res.status(201).json({ 
      success: true, 
      message: 'Vehicle added to garage',
      vehicleId: result.insertId,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('❌ Add vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add vehicle',
      error: error.message 
    });
  }
});

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
    
    const [vehicles] = await db.promise().query(sql, [userId]);
    
    console.log(`✅ Found ${vehicles.length} vehicles for user ${userId}`);
    
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('❌ Garage error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch garage' });
  }
});

// ============ GET UNREAD NOTIFICATIONS COUNT ============
app.get('/api/notifications/unread-count', auth, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE';
    const [result] = await db.promise().query(sql, [userId]);
    
    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error('Notifications error:', error);
    res.json({ success: true, count: 0 }); // Return 0 on error
  }
});

// ============ GET SOCIAL POSTS ============
app.get('/api/social/posts', async (req, res) => {
  try {
    // For now, return empty array until you implement posts
    res.json({ success: true, posts: [] });
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

console.log('✓ SERVER.JS COMPLETED - Line 596');
