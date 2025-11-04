const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// ============ LOGIN ROUTE ============
router.post('/login', async (req, res) => {
  try {
    console.log('📥 LOGIN REQUEST:', req.body);
    console.log('📥 Type of identifier:', typeof req.body.identifier);
    console.log('📥 Type of password:', typeof req.body.password);
    console.log('📥 Identifier value:', JSON.stringify(req.body.identifier));
    console.log('📥 Password value:', JSON.stringify(req.body.password));
    
    const { identifier, email, password } = req.body;
    const loginIdentifier = identifier || email;

    console.log('📥 loginIdentifier after assignment:', JSON.stringify(loginIdentifier));
    console.log('📥 password after assignment:', JSON.stringify(password));
    console.log('📥 Check result - !loginIdentifier:', !loginIdentifier);
    console.log('📥 Check result - !password:', !password);

    if (!loginIdentifier || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        success: false,
        error: 'Email/username and password are required' 
      });
    }

    console.log('✅ Passed validation - Looking up user:', loginIdentifier);

    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [loginIdentifier, loginIdentifier]
    );

    console.log('📊 Query returned', users.length, 'users');

    if (users.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email/username or password' 
      });
    }

    const user = users[0];
    console.log('✅ User found:', user.username);

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email/username or password' 
      });
    }

    console.log('🤫 JWT Secret used for signing:', process.env.JWT_SECRET ? 'Exists' : 'MISSING!');
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    });

    console.log('✅ Login successful');
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed',
      details: error.message 
    });
  }
});

module.exports = router;