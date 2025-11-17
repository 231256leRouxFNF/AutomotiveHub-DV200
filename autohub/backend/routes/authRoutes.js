const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { attemptFallbackLogin, ENABLE_FALLBACK } = require('../config/fallbackAuth');

const router = express.Router();

// Helper to retry transient DB errors (e.g. ETIMEDOUT)
async function tryQuery(sql, params, attempts = 2, delayMs = 250) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await db.query(sql, params);
    } catch (err) {
      lastError = err;
      console.warn(`DB query attempt ${i + 1} failed:`, err && err.code ? err.code : err && err.message ? err.message : err);
      if ((err && err.code === 'ETIMEDOUT') && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

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

    // Attempt DB query with retry
    let users;
    try {
      const result = await tryQuery(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [loginIdentifier, loginIdentifier]
      );
      users = result[0] || result;
    } catch (err) {
      console.error('DB query failed in login route:', err && err.message ? err.message : err);
      // If timed out and fallback enabled, attempt fallback auth
      if (err && err.code === 'ETIMEDOUT' && ENABLE_FALLBACK) {
        console.warn('DB timed out; attempting fallback auth.');
        const fbUser = await attemptFallbackLogin(loginIdentifier, password);
        if (fbUser) {
          const token = jwt.sign(
            { id: fbUser.id, email: fbUser.email, username: fbUser.username, role: fbUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.json({ success: true, token, user: fbUser, message: 'Login successful (fallback)' });
        }

        return res.status(503).json({ success: false, error: 'Database unavailable and fallback login failed' });
      }
      throw err;
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password'
      });
    }

    const user = users[0];
    console.log('✅ User found:', user.username || user.email);

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
      { id: user.id, email: user.email, username: user.username, role: user.role },
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
    console.error('❌ Login error:', error && (error.stack || error));

    if (error && error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'Database connection timed out',
        details: 'Please check database connectivity and allowlist the deployment IP.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error && error.message ? error.message : String(error)
    });
  }
});

module.exports = router;