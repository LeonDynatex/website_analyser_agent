const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('./logger');
require('dotenv').config();

// Mock user database (in a real app, this would be a database)
const users = [
  {
    id: 1,
    username: 'admin',
    // Default password: 'password'
    password: '$2a$10$aCH7tL.hxj1Uo1RD3zHRaOXrwrOYL3jJ7vX3Uu2xUMGV7VnKY1b9W',
    role: 'admin'
  }
];

// Check if authentication is enabled
const isAuthEnabled = process.env.AUTH_ENABLED === 'true';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
};

// Authenticate user
const authenticate = async (username, password) => {
  // If auth is disabled, return a mock token
  if (!isAuthEnabled) {
    logger.info('Authentication is disabled, returning mock token');
    return { 
      token: 'mock-token-auth-disabled',
      user: { username: 'guest', role: 'guest' }
    };
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    logger.warn(`Authentication failed: User ${username} not found`);
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`Authentication failed: Invalid password for user ${username}`);
    return null;
  }

  logger.info(`User ${username} authenticated successfully`);
  return {
    token: generateToken(user),
    user: { id: user.id, username: user.username, role: user.role }
  };
};

// Auth middleware
const authMiddleware = (req, res, next) => {
  // If auth is disabled, skip authentication
  if (!isAuthEnabled) {
    req.user = { username: 'guest', role: 'guest' };
    return next();
  }

  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`Authentication failed: ${err.message}`);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = {
  authenticate,
  authMiddleware,
  isAuthEnabled
};
