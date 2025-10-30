const db = require('./config/db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Ensure express is defined
const express = require('express');
const Notification = require('./models/Notification'); // Import Notification model
const { auth } = require('./middleware/auth'); // Import auth middleware
const crypto = require('crypto'); // For generating tokens
// const nodemailer = require('nodemailer'); // For sending emails (uncomment and configure for production)

const app = express();

// Replace this entire CORS section:
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://www.automotivehub.digital',
      'https://automotivehub-dv200-1.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow all Vercel deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import routes
const listingRoutes = require('./routes/listingRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes
const followRoutes = require('./routes/followRoutes'); // Import follow routes

// Use routes
app.use('/api/listings', listingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes); // Use notification routes
app.use('/api/follows', followRoutes); // Use follow routes

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Multer configuration for profile image uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/'); // Directory to save profile images
  },
  filename: (req, file, cb) => {
    // Use user ID to name the profile image, ensuring uniqueness and easy retrieval
    const userId = req.params.id; // Get userId from request parameters
    if (!userId) {
      return cb(new Error('User ID is required for profile image upload'));
    }
    const fileExtension = path.extname(file.originalname);
    cb(null, `profile-${userId}${fileExtension}`);
  },
});
const uploadProfile = multer({ storage: profileStorage });

app.get('/', (req, res) => {
  res.send('API is working');
});

// Endpoint to upload/update user profile photo
app.post('/api/users/:id/profile/avatar', uploadProfile.single('avatar'), async (req, res) => {
  const userId = req.params.id;
  const avatarUrl = `/uploads/profiles/${req.file.filename}`;

  // Update the profiles table with the new avatar_url
  const sql = 'UPDATE profiles SET avatar_url = ? WHERE user_id = ?';
  try {
    const [result] = await db.promise().query(sql, [avatarUrl, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    res.status(200).json({ success: true, message: 'Profile avatar updated successfully', avatar_url: avatarUrl });
  } catch (err) {
    console.error('Error updating profile avatar:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile avatar' });
  }
});

// Add a quick DB test route (if you don't already have one)
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ AUTOHUB API ENDPOINTS ============

// Get all users (admin only - add auth later)
app.get('/api/users', async (req, res) => {
  try {
    const sql = 'SELECT id, username, email, role, created_at, last_login FROM users ORDER BY created_at DESC';
    const [results] = await db.promise().query(sql);
    res.json(results);
  } catch (err) {
    console.error('Users query error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user profile by ID
app.get('/api/users/:id/profile', auth, async (req, res) => {
  const userId = req.params.id;
  const requestingUserId = req.userId; // Assuming auth middleware provides this

  try {
    const profileSql = `
      SELECT u.id, u.username, u.email, u.created_at, 
             p.display_name, p.avatar_url, p.bio, p.location
      FROM users u 
      LEFT JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = ?
    `;
    const [profileResults] = await db.promise().query(profileSql, [userId]);

    if (profileResults.length === 0) {
      console.log(`Profile for user ID ${userId} not found in DB.`);
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = profileResults[0];
    console.log(`Fetched profile data for user ID ${userId}:`, profile);

    // Get follower count
    const followersCountSql = 'SELECT COUNT(*) as count FROM follows WHERE followee_id = ?';
    const [followersCountResults] = await db.promise().query(followersCountSql, [userId]);
    profile.followersCount = followersCountResults[0].count;
    console.log(`Followers count for user ID ${userId}:`, profile.followersCount);

    // Get following count
    const followingCountSql = 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?';
    const [followingCountResults] = await db.promise().query(followingCountSql, [userId]);
    profile.followingCount = followingCountResults[0].count;
    console.log(`Following count for user ID ${userId}:`, profile.followingCount);

    // Check if requesting user is following this profile
    if (requestingUserId) {
      const isFollowingSql = 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?';
      const [isFollowingResults] = await db.promise().query(isFollowingSql, [requestingUserId, userId]);
      profile.isFollowing = isFollowingResults[0].count > 0;
      console.log(`User ${requestingUserId} is following ${userId}:`, profile.isFollowing);

      // Get mutual followers
      const mutualsSql = `
        SELECT u.id, u.username, p.display_name, p.avatar_url
        FROM follows AS f1
        JOIN follows AS f2 ON f1.follower_id = f2.follower_id
        JOIN users AS u ON f1.follower_id = u.id
        LEFT JOIN profiles AS p ON u.id = p.user_id
        WHERE f1.followee_id = ? AND f2.followee_id = ? AND f1.follower_id != ?
      `;
      const [mutualsResults] = await db.promise().query(mutualsSql, [userId, requestingUserId, requestingUserId]);
      profile.mutualFollowers = mutualsResults;
      console.log(`Mutual followers for user ID ${userId} and ${requestingUserId}:`, profile.mutualFollowers);
    } else {
      profile.isFollowing = false;
      profile.mutualFollowers = [];
      console.log(`No requesting user. isFollowing: false, mutualFollowers: []`);
    }
    
    res.json(profile);
  } catch (err) {
    console.error('User profile query error:', err);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Endpoint to update user profile information
app.put('/api/users/:id/profile', auth, async (req, res) => {
  const userId = req.params.id;
  const { display_name, bio, location } = req.body;

  // Ensure the user is authenticated and is updating their own profile
  if (!req.userId || parseInt(req.userId) !== parseInt(userId)) {
    return res.status(403).json({ message: 'Unauthorized to update this profile' });
  }

  try {
    const updateSql = `
      UPDATE profiles 
      SET display_name = ?, bio = ?, location = ? 
      WHERE user_id = ?
    `;
    const [updateResult] = await db.promise().query(updateSql, [display_name, bio, location, userId]);

    if (updateResult.affectedRows === 0) {
      // If no rows were affected, it might be a new user without a profile entry yet
      // In this case, we should insert a new profile record
      const insertSql = `
        INSERT INTO profiles (user_id, display_name, bio, location)
        VALUES (?, ?, ?, ?)
      `;
      await db.promise().query(insertSql, [userId, display_name, bio, location]);
      return res.status(201).json({ message: 'Profile created and updated successfully' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// Get all users with profile information (for community feed)
app.get('/api/community/users', auth, async (req, res) => {
  const requestingUserId = req.userId;
  try {
    const usersSql = `
      SELECT u.id, u.username, p.display_name, p.avatar_url, p.bio, p.location
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id != ? OR ? IS NULL
    `;
    const [users] = await db.promise().query(usersSql, [requestingUserId, requestingUserId]);

    const usersWithFollowInfo = await Promise.all(users.map(async user => {
      const followCountSql = 'SELECT COUNT(*) as count FROM follows WHERE followee_id = ?';
      const [followersCountResults] = await db.promise().query(followCountSql, [user.id]);
      user.followersCount = followersCountResults[0].count;

      if (requestingUserId) {
        const isFollowingSql = 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND followee_id = ?';
        const [isFollowingResults] = await db.promise().query(isFollowingSql, [requestingUserId, user.id]);
        user.isFollowing = isFollowingResults[0].count > 0;
      } else {
        user.isFollowing = false;
      }
      return user;
    }));

    res.json(usersWithFollowInfo);
  } catch (err) {
    console.error('Error fetching community users:', err);
    res.status(500).json({ message: 'Failed to fetch community users' });
  }
});

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const sql = `
      SELECT v.*, u.username as owner_username, p.display_name as owner_name
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY v.created_at DESC
    `;
    const [results] = await db.promise().query(sql);
    res.json(results);
  } catch (err) {
    console.error('Vehicles query error:', err);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID with images and modifications
app.get('/api/vehicles/:id', async (req, res) => {
  const vehicleId = req.params.id;
  try {
    const vehicleSql = `
      SELECT v.*, u.username as owner_username, p.display_name as owner_name
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE v.id = ?
    `;

    const [vehicleResults] = await db.promise().query(vehicleSql, [vehicleId]);
    if (vehicleResults.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const vehicle = vehicleResults[0];

    // Get vehicle images
    const imagesSql = 'SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY sort_order, id';
    const [imageResults] = await db.promise().query(imagesSql, [vehicleId]);

    // Get vehicle modifications
    const modsSql = 'SELECT * FROM modifications WHERE vehicle_id = ? ORDER BY installed_at DESC';
    const [modResults] = await db.promise().query(modsSql, [vehicleId]);

    res.json({
      ...vehicle,
      images: imageResults,
      modifications: modResults
    });
  } catch (err) {
    console.error('Vehicle query error:', err);
    res.status(500).json({ message: 'Failed to fetch vehicle' });
  }
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

// Get all posts by a specific user ID with user info and images
app.get('/api/social/posts/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT p.*, u.username, pr.display_name, pr.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN profiles pr ON u.id = pr.user_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('User posts query error:', err);
      return res.status(500).json({ message: 'Failed to fetch user posts' });
    }
    
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
        console.error('User posts details query error:', error);
        res.status(500).json({ message: 'Failed to fetch user post details' });
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

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, email, and password are required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address' 
    });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  try {
    // Check if username or email already exists
    const checkSql = 'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1';
    const existingUser = await new Promise((resolve, reject) => {
      db.query(checkSql, [username, email.toLowerCase()], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const insertSql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, [username, email.toLowerCase(), hashedPassword], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Create JWT token for auto-login after registration
    const payload = { 
      id: result.insertId, 
      username: username, 
      email: email.toLowerCase() 
    };
    
    let token = null;
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        token = jwt.sign(payload, secret, { expiresIn: '7d' });
      }
    } catch (e) {
      console.warn('JWT signing skipped:', e.message);
    }
    
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: token,
      user: { 
        id: result.insertId, 
        username: username, 
        email: email.toLowerCase() 
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// Forgot Password - Request Reset Link
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const [users] = await db.promise().query('SELECT id, email FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      // For security, always return a generic success message even if email not found
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await db.promise().query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    // --- Email Sending Logic (Placeholder) ---
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    console.log(`Password Reset Link for ${user.email}: ${resetUrl}`);
    // In a real application, you would send an email here using nodemailer or a similar service.
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `${resetUrl}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    */
    // --- End Email Sending Logic ---

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error processing request.' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const [users] = await db.promise().query(
      'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
      [token]
    );
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash new password

    await db.promise().query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error processing request.' });
  }
});

// Login endpoint allowing username or email (case-insensitive)
app.post('/api/login', (req, res) => {
  console.log('Login request received:', { body: req.body });
  const { identifier, password } = req.body || {};
  const ident = (identifier ?? '').toString().trim();
  if (!ident || !password) {
    console.warn('Missing credentials:', { hasIdent: !!ident, hasPassword: !!password });
    return res.status(400).json({ success: false, message: 'Identifier and password are required' });
  }

  const sql = `
    SELECT id, username, email, password_hash
    FROM users
    WHERE LOWER(username) = ? OR LOWER(email) = ?
    LIMIT 1
  `;

  const identLower = ident.toLowerCase();
  console.log('Querying user with identifier:', identLower);

  db.query(sql, [identLower, identLower], async (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }

    if (!results || results.length === 0) {
      console.warn('User not found:', identLower);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log('User found:', { id: user.id, username: user.username, email: user.email });

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        console.warn('Password mismatch for user:', user.username);
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

      console.log('Login successful for user:', user.username);
      return res.json({
        success: true,
        message: 'Login successful',
        token: token || null,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (e) {
      console.error('Password compare error:', e);
      return res.status(500).json({ success: false, message: 'Internal server error', error: e.message });
    }
  });
});

// Listings collection
// app.get('/api/listings', (req, res) => {
//   const { q, category, condition, make, sort } = req.query;
//   let sql = 'SELECT id, title, price, location, condition, seller, image_url as image FROM listings';
//   const params = [];
//   const where = [];
//   if (q) { where.push('(title LIKE ? OR description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
//   if (category) { where.push('category = ?'); params.push(category); }
//   if (condition) { where.push('condition = ?'); params.push(condition); }
//   if (make) { where.push('make = ?'); params.push(make); }
//   if (where.length) sql += ' WHERE ' + where.join(' AND ');
//   if (sort === 'price_asc') sql += ' ORDER BY price_cents ASC';
//   else if (sort === 'price_desc') sql += ' ORDER BY price_cents DESC';
//   else sql += ' ORDER BY created_at DESC';
//   db.query(sql, params, (err, rows) => {
//     if (err) {
//       if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
//       console.error('List listings error:', err);
//       return res.status(500).json({ message: 'Failed to load listings' });
//     }
//     res.json(rows || []);
//   });
// });

// Featured listings
app.get('/api/featured-listings', (req, res) => {
  const sql = `
    SELECT v.id, v.make, v.model, v.year, v.description, vi.url AS image
    FROM vehicles v
    LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = 1
    WHERE v.is_featured = 1
    ORDER BY v.created_at DESC
    LIMIT 8
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Featured vehicles error:', err);
      return res.status(500).json({ message: 'Failed to load featured vehicles' });
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

// Unified search endpoint for listings and events
app.get('/api/search', async (req, res) => {
  const { q, category, location } = req.query;
  const searchTerm = `%${q || ''}%`;

  try {
    // Search listings
    let listingsSql = `
      SELECT id, title, description, price, location, 'listing' as type, imageUrls
      FROM listings
      WHERE (title LIKE ? OR description LIKE ? OR location LIKE ?)
    `;
    const listingsParams = [searchTerm, searchTerm, searchTerm];

    if (category) {
      listingsSql += ' AND category = ?';
      listingsParams.push(category);
    }
    if (location) {
      listingsSql += ' AND location LIKE ?';
      listingsParams.push(`%${location}%`);
    }

    const listingsPromise = new Promise((resolve, reject) => {
      db.query(listingsSql, listingsParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Search events
    let eventsSql = `
      SELECT id, title, description, date as timestamp, location, 'event' as type, imageUrl as imageUrls
      FROM events
      WHERE (title LIKE ? OR description LIKE ? OR location LIKE ?)
    `;
    const eventsParams = [searchTerm, searchTerm, searchTerm];

    // For simplicity, let's assume events might also have categories or we can map them
    // For now, no category filter for events unless explicitly added to events table
    if (location) {
      eventsSql += ' AND location LIKE ?';
      eventsParams.push(`%${location}%`);
    }

    const eventsPromise = new Promise((resolve, reject) => {
      db.query(eventsSql, eventsParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const [listings, events] = await Promise.all([listingsPromise, eventsPromise]);

    res.json({ listings: listings || [], events: events || [] });

  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ message: 'Failed to perform search' });
  }
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

// Create a new community post
app.post('/api/posts', (req, res) => {
  const { author, avatar_url, content, image_url, userId: postUserId } = req.body || {};

  if (!content || !String(content).trim()) {
    return res.status(400).json({ message: 'Content is required' });
  }

  const safeAuthor = (author && String(author).trim()) || 'Guest';
  const safeAvatar = avatar_url ? String(avatar_url) : null;
  const safeImage = image_url ? String(image_url) : null;
  const timestamp = new Date().toLocaleString();
  const userId = postUserId; // Assuming userId is passed from frontend or determined by auth middleware

  // Regex to find mentions like @username
  const mentionRegex = /@(\w+)/g;
  const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);

  const sql = 'INSERT INTO posts (user_id, author, avatar_url, content, image_url, likes, comments, featured, timestamp) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)';
  const params = [userId, safeAuthor, safeAvatar, String(content).trim(), safeImage, timestamp];

  db.query(sql, params, (err, result) => {
    if (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(503).json({ message: 'Posts table not ready. Please run database setup.' });
      }
      console.error('Create post error:', err);
      return res.status(500).json({ message: 'Failed to create post' });
    }

    const newPostId = result.insertId;

    // Handle mentions: find mentioned users and create notifications
    if (mentions.length > 0) {
      const uniqueMentions = [...new Set(mentions)];
      const findUsersSql = 'SELECT id FROM users WHERE username IN (?)';
      db.query(findUsersSql, [uniqueMentions], (userErr, users) => {
        if (userErr) {
          console.error('Error finding mentioned users:', userErr);
          // Continue without sending notifications if there's an error
          return;
        }

        users.forEach(mentionedUser => {
          // Ensure the user is not tagging themselves
          if (mentionedUser.id !== userId) {
            const notificationData = {
              userId: mentionedUser.id,
              type: 'mention',
              message: `@${safeAuthor} mentioned you in a post: "${String(content).trim().substring(0, 50)}..."`,
              link: `/community/post/${newPostId}`,
              isRead: 0,
            };
            Notification.create(notificationData, (notifErr) => {
              if (notifErr) {
                console.error('Error creating mention notification:', notifErr);
              }
            });
          }
        });
      });
    }

    return res.status(201).json({
      id: newPostId,
      author: safeAuthor,
      avatar: safeAvatar,
      content: String(content).trim(),
      image: safeImage,
      likes: 0,
      comments: 0,
      featured: false,
      timestamp
    });
  });
});

// Create a new comment for a post
app.post('/api/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const { userId, content } = req.body;

  if (!userId || !content || !String(content).trim()) {
    return res.status(400).json({ message: 'User ID and content are required' });
  }

  try {
    // Check if post exists
    const postExists = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM posts WHERE id = ?', [postId], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      });
    });

    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Insert new comment
    const insertCommentSql = 'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)';
    const commentResult = await new Promise((resolve, reject) => {
      db.query(insertCommentSql, [postId, userId, String(content).trim()], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const newCommentId = commentResult.insertId;

    // Update comments count on the post
    db.query('UPDATE posts SET comments = comments + 1 WHERE id = ?', [postId], (err) => {
      if (err) console.error('Error updating post comment count:', err);
    });

    // Handle mentions in the comment
    const mentionRegex = /@(\w+)/g;
    const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);

    if (mentions.length > 0) {
      const uniqueMentions = [...new Set(mentions)];
      const findUsersSql = 'SELECT id FROM users WHERE username IN (?)';

      db.query(findUsersSql, [uniqueMentions], (userErr, users) => {
        if (userErr) {
          console.error('Error finding mentioned users in comment:', userErr);
          return;
        }

        users.forEach(mentionedUser => {
          // Ensure the user is not tagging themselves
          if (mentionedUser.id !== userId) {
            const notificationData = {
              userId: mentionedUser.id,
              type: 'comment_mention',
              message: `@${userId} mentioned you in a comment on a post: "${String(content).trim().substring(0, 50)}..."`,
              link: `/community/post/${postId}/comment/${newCommentId}`,
              isRead: 0,
            };
            Notification.create(notificationData, (notifErr) => {
              if (notifErr) {
                console.error('Error creating comment mention notification:', notifErr);
              }
            });
          }
        });
      });
    }

    res.status(201).json({
      id: newCommentId,
      postId: postId,
      userId: userId,
      content: String(content).trim(),
      created_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
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

// ============ GARAGE API ENDPOINTS ============

// Get garage statistics for a user
app.get('/api/garage/stats/:userId', (req, res) => {
  const userId = req.params.userId;
  db.query(
    `
    SELECT 
      COUNT(*) AS totalVehicles,
      SUM(CASE WHEN v.is_featured = 1 THEN 1 ELSE 0 END) AS featured
    FROM vehicles v
    WHERE v.user_id = ?
    `,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching garage stats:', err);
        return res.status(500).json({ message: 'Failed to fetch garage statistics' });
      }
      res.json(results[0]);
    }
  );
});

// Get user's vehicles
app.get('/api/garage/vehicles/:userId', (req, res) => {
  const userId = req.params.userId;
  try {
    // Get vehicles for the user
    db.query(
      `SELECT v.*, vi.url AS image_url
       FROM vehicles v
       LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = 1
       WHERE v.user_id = ?`,
      [userId],
      (err, vehicles) => {
        if (err) {
          console.error('Error fetching vehicles:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
        }
        // Optionally, fetch all images for each vehicle if you want a gallery
        res.json(vehicles);
      }
    );
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
});

// Create new vehicle (with image upload support)
app.post('/api/garage/vehicles', upload.array('images'), async (req, res) => {
  const body = req.body || {};
  const userId = body.user_id ?? body.userId;
  const { make, model, year, color, description, imageUrl } = body;
  // Basic required fields
  if (!userId || !make || !model || !year || !color) {
    return res.status(400).json({ 
      success: false, 
      message: 'User ID, make, model, year, and color are required' 
    });
  }

  // Coerce and validate year
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear() + 1;
  if (Number.isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 4-digit year'
    });
  }

  try {
    // Ensure user exists to avoid FK error (preflight check)
    const userExists = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows && rows.length > 0);
      });
    });
    if (!userExists) {
      return res.status(400).json({ success: false, message: 'Invalid userId: user does not exist' });
    }

    // Insert vehicle (no image_url, handled in images table)
    const vehicleSql = 'INSERT INTO vehicles (user_id, make, model, year, color, description) VALUES (?, ?, ?, ?, ?, ?)';
    const vehicleResult = await new Promise((resolve, reject) => {
      db.query(vehicleSql, [userId, make, model, yearNum, color, description], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    const vehicleId = vehicleResult.insertId;

    // Save uploaded images to vehicle_images table (uploaded files)
    let primaryImageSet = false;
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO vehicle_images (vehicle_id, url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
            [vehicleId, imageUrl, i === 0 ? 1 : 0, i],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });
        if (i === 0) primaryImageSet = true;
      }
    }

    // If an imageUrl was provided in the body (URL), upsert as primary when no files uploaded
    if (imageUrl && !primaryImageSet) {
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO vehicle_images (vehicle_id, url, is_primary, sort_order) VALUES (?, ?, 1, 0)',
          [vehicleId, imageUrl],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Vehicle added successfully!',
      vehicleId: vehicleId
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database tables not ready. Please run database setup.' 
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({ success: false, message: 'Invalid reference: ensure userId exists' });
    }
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE' || error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ success: false, message: 'Invalid field value (e.g., year)' });
    }
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ success: false, message: 'One of the fields is too long' });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to add vehicle' 
    });
  }
});

// Update vehicle
app.put('/api/garage/vehicles/:vehicleId', async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const { make, model, year, color, description, imageUrl } = req.body || {};

  // Coerce and validate year when provided
  let yearNum = null;
  if (year !== undefined) {
    const parsed = parseInt(year, 10);
    const currentYear = new Date().getFullYear() + 1;
    if (Number.isNaN(parsed) || parsed < 1886 || parsed > currentYear) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 4-digit year' });
    }
    yearNum = parsed;
  }

  try {
    // Update core fields (no image_url or updated_at column)
    const updateSql = 'UPDATE vehicles SET make = ?, model = ?, year = ?, color = ?, description = ? WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.query(updateSql, [make, model, yearNum, color, description, vehicleId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Upsert primary image if imageUrl provided
    if (imageUrl) {
      const selectImgSql = 'SELECT id FROM vehicle_images WHERE vehicle_id = ? AND is_primary = 1 LIMIT 1';
      const existing = await new Promise((resolve, reject) => {
        db.query(selectImgSql, [vehicleId], (err, rows) => {
          if (err) return reject(err);
          resolve(rows && rows[0]);
        });
      });

      if (existing) {
        const updateImgSql = 'UPDATE vehicle_images SET url = ? WHERE id = ?';
        await new Promise((resolve, reject) => {
          db.query(updateImgSql, [imageUrl, existing.id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
      } else {
        const insertImgSql = 'INSERT INTO vehicle_images (vehicle_id, url, is_primary) VALUES (?, ?, 1)';
        await new Promise((resolve, reject) => {
          db.query(insertImgSql, [vehicleId, imageUrl], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
      }
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully!'
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update vehicle' 
    });
  }
});

// Delete vehicle
app.delete('/api/garage/vehicles/:vehicleId', async (req, res) => {
  const vehicleId = req.params.vehicleId;
  
  try {
    // Hard delete vehicle; vehicle_images will cascade delete
    const deleteSql = 'DELETE FROM vehicles WHERE id = ? LIMIT 1';
    await new Promise((resolve, reject) => {
      db.query(deleteSql, [vehicleId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully!'
    });
    
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete vehicle' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
