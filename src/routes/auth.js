const express = require('express');
const router = express.Router();
const { authenticate, isAuthEnabled } = require('../services/auth');
const logger = require('../services/logger');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      logger.warn('Login attempt missing username or password');
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    
    logger.info(`Login attempt for user: ${username}`);
    
    const authResult = await authenticate(username, password);
    
    if (!authResult) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    logger.info(`Successful login for user: ${username}`);
    
    return res.json({
      success: true,
      ...authResult
    });
  } catch (error) {
    logger.error(`Error in /api/auth/login: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/auth/status
 * @desc Check authentication status
 * @access Public
 */
router.get('/status', (req, res) => {
  logger.info('Auth status check requested');
  return res.json({
    success: true,
    authEnabled: isAuthEnabled
  });
});

module.exports = router;
