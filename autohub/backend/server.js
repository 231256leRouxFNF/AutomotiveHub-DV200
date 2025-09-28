const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1', (err, result) => {
    if (err) return res.status(500).send('DB Error');
    res.send('DB Connected!');
  });
});

// ============ AUTOHUB API ENDPOINTS ============

// Get all users (admin only - add auth later)
app.get('/api/users', (req, res) => {
  const sql = 'SELECT id, username, email, role, created_at, last_login FROM users ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Users query error:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// Get user profile by ID
app.get('/api/users/:id/profile', (req, res) => {
  const userId = req.params.id;
  const sql = `
    SELECT u.id, u.username, u.email, u.created_at, 
           p.display_name, p.avatar_url, p.bio, p.location
    FROM users u 
    LEFT JOIN profiles p ON u.id = p.user_id 
    WHERE u.id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('User profile query error:', err);
      return res.status(500).json({ message: 'Failed to fetch user profile' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
  const sql = `
    SELECT v.*, u.username as owner_username, p.display_name as owner_name
    FROM vehicles v
    JOIN users u ON v.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id
    ORDER BY v.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Vehicles query error:', err);
      return res.status(500).json({ message: 'Failed to fetch vehicles' });
    }
    res.json(results);
  });
});

// Get vehicle by ID with images and modifications
app.get('/api/vehicles/:id', (req, res) => {
  const vehicleId = req.params.id;
  const vehicleSql = `
    SELECT v.*, u.username as owner_username, p.display_name as owner_name
    FROM vehicles v
    JOIN users u ON v.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE v.id = ?
  `;
  
  db.query(vehicleSql, [vehicleId], (err, vehicleResults) => {
    if (err) {
      console.error('Vehicle query error:', err);
      return res.status(500).json({ message: 'Failed to fetch vehicle' });
    }
    if (vehicleResults.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    const vehicle = vehicleResults[0];
    
    // Get vehicle images
    const imagesSql = 'SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY sort_order, id';
    db.query(imagesSql, [vehicleId], (imgErr, imageResults) => {
      if (imgErr) {
        console.error('Vehicle images query error:', imgErr);
        return res.status(500).json({ message: 'Failed to fetch vehicle images' });
      }
      
      // Get vehicle modifications
      const modsSql = 'SELECT * FROM modifications WHERE vehicle_id = ? ORDER BY installed_at DESC';
      db.query(modsSql, [vehicleId], (modErr, modResults) => {
        if (modErr) {
          console.error('Vehicle modifications query error:', modErr);
          return res.status(500).json({ message: 'Failed to fetch vehicle modifications' });
        }
        
        res.json({
          ...vehicle,
          images: imageResults,
          modifications: modResults
        });
      });
    });
  });
});

// Get all posts with user info and images
app.get('/api/social/posts', (req, res) => {
  const sql = `
    SELECT p.*, u.username, pr.display_name, pr.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN profiles pr ON u.id = pr.user_id
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Posts query error:', err);
      return res.status(500).json({ message: 'Failed to fetch posts' });
    }
    
    // Get images and comments count for each post
    const postPromises = results.map(post => {
      return new Promise((resolve, reject) => {
        const imagesSql = 'SELECT url FROM post_images WHERE post_id = ? ORDER BY sort_order';
        const commentsSql = 'SELECT COUNT(*) as count FROM comments WHERE post_id = ?';
        
        db.query(imagesSql, [post.id], (imgErr, imageResults) => {
          if (imgErr) return reject(imgErr);
          
          db.query(commentsSql, [post.id], (commentErr, commentResults) => {
            if (commentErr) return reject(commentErr);
            
            resolve({
              ...post,
              images: imageResults.map(img => img.url),
              comments_count: commentResults[0].count
            });
          });
        });
      });
    });
    
    Promise.all(postPromises)
      .then(postsWithDetails => res.json(postsWithDetails))
      .catch(error => {
        console.error('Posts details query error:', error);
        res.status(500).json({ message: 'Failed to fetch post details' });
      });
  });
});

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const sql = `
    SELECT c.*, u.username, p.display_name, p.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('Comments query error:', err);
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
    res.json(results);
  });
});

// Get user followers/following
app.get('/api/users/:id/follows', (req, res) => {
  const userId = req.params.id;
  const type = req.query.type; // 'followers' or 'following'
  
  let sql;
  if (type === 'followers') {
    sql = `
      SELECT u.id, u.username, p.display_name, p.avatar_url, f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE f.followee_id = ?
      ORDER BY f.created_at DESC
    `;
  } else {
    sql = `
      SELECT u.id, u.username, p.display_name, p.avatar_url, f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.followee_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `;
  }
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Follows query error:', err);
      return res.status(500).json({ message: 'Failed to fetch follows' });
    }
    res.json(results);
  });
});

// Login endpoint allowing username or email
app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier and password are required' });
  }

  const sql = `
    SELECT id, username, email, password_hash
    FROM users
    WHERE username = ? OR email = ?
    LIMIT 1
  `;

  db.query(sql, [identifier, identifier.toLowerCase ? identifier.toLowerCase() : identifier], async (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const payload = { id: user.id, username: user.username, email: user.email };
      let token;
      try {
        const secret = process.env.JWT_SECRET;
        if (secret) {
          token = jwt.sign(payload, secret, { expiresIn: '7d' });
        }
      } catch (e) {
        console.warn('JWT signing skipped:', e.message);
      }

      return res.json({
        success: true,
        message: 'Login successful',
        token: token || null,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (e) {
      console.error('Password compare error:', e);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
});

// Listings collection
app.get('/api/listings', (req, res) => {
  const { q, category, condition, make, sort } = req.query;
  let sql = 'SELECT id, title, price, location, condition, seller, image_url as image FROM listings';
  const params = [];
  const where = [];
  if (q) { where.push('(title LIKE ? OR description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (category) { where.push('category = ?'); params.push(category); }
  if (condition) { where.push('condition = ?'); params.push(condition); }
  if (make) { where.push('make = ?'); params.push(make); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  if (sort === 'price_asc') sql += ' ORDER BY price_cents ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY price_cents DESC';
  else sql += ' ORDER BY created_at DESC';
  db.query(sql, params, (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('List listings error:', err);
      return res.status(500).json({ message: 'Failed to load listings' });
    }
    res.json(rows || []);
  });
});

// Featured listings
app.get('/api/featured-listings', (req, res) => {
  const sql = `SELECT id, title, short_description as description, price, image_url as image FROM listings WHERE is_featured = 1 ORDER BY featured_order ASC LIMIT 8`;
  db.query(sql, (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Featured listings error:', err);
      return res.status(500).json({ message: 'Failed to load featured listings' });
    }
    res.json(rows || []);
  });
});

// Categories
app.get('/api/categories', (req, res) => {
  const sql = `SELECT slug as name, icon_emoji as icon FROM categories ORDER BY sort_order ASC`;
  db.query(sql, (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Categories error:', err);
      return res.status(500).json({ message: 'Failed to load categories' });
    }
    res.json(rows || []);
  });
});

// Listing details
app.get('/api/listings/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT id, title, description, price, location, condition, make, model, year FROM listings WHERE id = ? LIMIT 1`;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json(null);
      console.error('Listing details error:', err);
      return res.status(500).json({ message: 'Failed to load listing' });
    }
    const listing = rows && rows[0];
    if (!listing) return res.json(null);
    const imagesSql = `SELECT url FROM listing_images WHERE listing_id = ? ORDER BY sort_order ASC`;
    const specsSql = `SELECT label, value FROM listing_specs WHERE listing_id = ? ORDER BY sort_order ASC`;
    db.query(imagesSql, [id], (e1, imagesRows) => {
      if (e1 && e1.code !== 'ER_NO_SUCH_TABLE') return res.status(500).json({ message: 'Failed to load images' });
      db.query(specsSql, [id], (e2, specsRows) => {
        if (e2 && e2.code !== 'ER_NO_SUCH_TABLE') return res.status(500).json({ message: 'Failed to load specs' });
        res.json({
          ...listing,
          images: (imagesRows || []).map(r => r.url),
          specs: specsRows || [],
        });
      });
    });
  });
});

// Related listings
app.get('/api/listings/:id/related', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT l2.id, l2.title, l2.price, l2.image_url as image FROM listings l1 JOIN listings l2 ON l1.category = l2.category AND l2.id != l1.id WHERE l1.id = ? ORDER BY l2.created_at DESC LIMIT 8`;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Related listings error:', err);
      return res.status(500).json({ message: 'Failed to load related listings' });
    }
    res.json(rows || []);
  });
});

// Community posts
app.get('/api/posts', (req, res) => {
  const sql = `SELECT id, author, avatar_url as avatar, content, image_url as image, likes, comments, featured, timestamp FROM posts ORDER BY created_at DESC`;
  db.query(sql, (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Posts error:', err);
      return res.status(500).json({ message: 'Failed to load posts' });
    }
    res.json(rows || []);
  });
});

// Community stats
app.get('/api/community/stats', (req, res) => {
  const sql = `SELECT value, label, color FROM community_stats ORDER BY sort_order ASC`;
  db.query(sql, (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Community stats error:', err);
      return res.status(500).json({ message: 'Failed to load stats' });
    }
    res.json(rows || []);
  });
});

// Messages
app.get('/api/messages', (req, res) => {
  const userId = req.query.userId || null;
  const sql = userId ? `SELECT id, title, unread_count as unread FROM message_threads WHERE user_id = ? ORDER BY updated_at DESC` : `SELECT id, title, unread_count as unread FROM message_threads ORDER BY updated_at DESC`;
  db.query(sql, userId ? [userId] : [], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Messages error:', err);
      return res.status(500).json({ message: 'Failed to load messages' });
    }
    res.json(rows || []);
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId || null;
  const sql = userId ? `SELECT id, text FROM notifications WHERE user_id = ? ORDER BY created_at DESC` : `SELECT id, text FROM notifications ORDER BY created_at DESC`;
  db.query(sql, userId ? [userId] : [], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Notifications error:', err);
      return res.status(500).json({ message: 'Failed to load notifications' });
    }
    res.json(rows || []);
  });
});

// Orders
app.get('/api/orders', (req, res) => {
  const userId = req.query.userId || null;
  const sql = userId ? `SELECT id, item_name as item, status FROM orders WHERE user_id = ? ORDER BY created_at DESC` : `SELECT id, item_name as item, status FROM orders ORDER BY created_at DESC`;
  db.query(sql, userId ? [userId] : [], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Orders error:', err);
      return res.status(500).json({ message: 'Failed to load orders' });
    }
    res.json(rows || []);
  });
});

// My Listings
app.get('/api/my/listings', (req, res) => {
  const userId = req.query.userId || null;
  if (!userId) return res.json([]);
  const sql = `SELECT id, title, status FROM listings WHERE seller_id = ? ORDER BY updated_at DESC`;
  db.query(sql, [userId], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('My listings error:', err);
      return res.status(500).json({ message: 'Failed to load my listings' });
    }
    res.json(rows || []);
  });
});

// Cart
app.get('/api/cart', (req, res) => {
  const userId = req.query.userId || null;
  if (!userId) return res.json({ items: [], total: 0 });
  const itemsSql = `SELECT id, title, price_cents FROM cart_items WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(itemsSql, [userId], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json({ items: [], total: 0 });
      console.error('Cart error:', err);
      return res.status(500).json({ message: 'Failed to load cart' });
    }
    const totalCents = (rows || []).reduce((sum, r) => sum + (r.price_cents || 0), 0);
    res.json({ items: rows || [], total: totalCents });
  });
});

// Seller metrics
app.get('/api/seller/metrics', (req, res) => {
  const userId = req.query.userId || null;
  if (!userId) return res.json([]);
  const sql = `SELECT label, value FROM seller_metrics WHERE user_id = ? ORDER BY sort_order ASC`;
  db.query(sql, [userId], (err, rows) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
      console.error('Seller metrics error:', err);
      return res.status(500).json({ message: 'Failed to load metrics' });
    }
    res.json(rows || []);
  });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
