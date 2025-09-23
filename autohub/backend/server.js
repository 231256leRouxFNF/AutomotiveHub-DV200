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

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
