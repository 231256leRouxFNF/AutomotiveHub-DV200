console.log('🚀 SERVER.JS STARTED - Line 1');

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// ALWAYS load environment variables first
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('✓ Dotenv loaded');

// Now import db AFTER environment is loaded
const db = require('./config/db');
console.log('✓ DB loaded');

const app = express();

app.use(cors());
app.use(express.json());

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

// ============ LOGIN ROUTE (NEW VERSION) ============
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

// Check your LoginSection.js onSubmit function
// It should look like this:

const onSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.login({
      email: email,      // These should match the backend fields
      password: password // These should match the backend fields
    });
    
    // Handles success
  } catch (error) {
    console.error('Login error:', error);
  }
};