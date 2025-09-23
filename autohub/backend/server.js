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
