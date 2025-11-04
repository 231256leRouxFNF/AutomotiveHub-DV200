const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    req.userId = null; // No user is authenticated
    return next(); // Proceed even without a token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ JWT Verification Error:', err.message); // Log the specific error
      // It's better to send a 401 response directly from the middleware
      // if the token is present but invalid.
      return res.status(401).json({ message: `Invalid Token: ${err.message}` });
    }
    req.userId = user.id; // Add user ID to request object
    req.user = user; // Also keep req.user for other middlewares if needed
    next();
  });
};

// Middleware to verify admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Strict authentication middleware - REQUIRES a valid token
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ JWT Verification Error:', err.message);
      return res.status(401).json({ message: `Invalid Token: ${err.message}` });
    }
    req.userId = user.id;
    req.user = user; // Set req.user with the full user object from the token
    next();
  });
};

module.exports = {
  auth,
  requireAdmin,
  protect,
};
