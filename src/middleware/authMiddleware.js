const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

// Middleware to check if user is an organizer
const isOrganizer = (req, res, next) => {
  if (req.userRole !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only organizers can perform this action.',
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isOrganizer,
};
