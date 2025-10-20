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
      req.userId = null; // Invalid token, treat as unauthenticated
      return next(); // Proceed without a valid token
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

module.exports = {
  auth,
  requireAdmin,
};
