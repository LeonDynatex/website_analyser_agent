const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { analyzeWebsite, generateStyleGuide } = require('../services/analyzer');
const { authMiddleware } = require('../services/auth');
const logger = require('../services/logger');

/**
 * @route POST /api/analyze/single
 * @desc Analyze a single website
 * @access Public (or Private if auth is enabled)
 */
router.post('/single', authMiddleware, async (req, res) => {
  try {
    console.log('Received single analysis request:', req.body);
    logger.info('Received single analysis request body:', req.body);
    
    const { url } = req.body;
    
    if (!url) {
      logger.warn('Analyze request missing URL');
      return res.status(400).json({ message: 'URL is required' });
    }
    
    logger.info(`Received request to analyze website: ${url}`);
    
    const analysis = await analyzeWebsite(url);
    
    logger.info(`Successfully analyzed website: ${url}`);
    
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in /api/analyze/single:', error);
    logger.error(`Error in /api/analyze/single: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route POST /api/analyze/multiple
 * @desc Analyze multiple websites and generate a style guide
 * @access Public (or Private if auth is enabled)
 */
router.post('/multiple', authMiddleware, async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      logger.warn('Analyze multiple request missing URLs array');
      return res.status(400).json({ message: 'URLs array is required' });
    }
    
    if (urls.length > 5) {
      logger.warn(`Analyze multiple request with too many URLs: ${urls.length}`);
      return res.status(400).json({ message: 'Maximum 5 URLs allowed' });
    }
    
    logger.info(`Received request to analyze multiple websites: ${urls.join(', ')}`);
    
    // Analyze each website
    const analysisPromises = urls.map(url => analyzeWebsite(url));
    const analyses = await Promise.all(analysisPromises);
    
    // Generate style guide
    const styleGuide = generateStyleGuide(analyses);
    
    logger.info(`Successfully analyzed ${urls.length} websites and generated style guide`);
    
    return res.json({
      success: true,
      data: {
        analyses,
        styleGuide
      }
    });
  } catch (error) {
    logger.error(`Error in /api/analyze/multiple: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/analyze/status
 * @desc Check the status of the analyzer
 * @access Public
 */
router.get('/status', (req, res) => {
  logger.info('Status check requested');
  return res.json({
    success: true,
    message: 'Website Analyzer API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/analyze/download-docs/:filename
 * @desc Download the generated documentation
 * @access Public (or Private if auth is enabled)
 */
router.get('/download-docs/:filename', authMiddleware, (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      logger.warn(`Suspicious filename requested: ${filename}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid filename' 
      });
    }
    
    const filePath = path.join('/tmp', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn(`Documentation file not found: ${filePath}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Documentation file not found' 
      });
    }
    
    logger.info(`Sending documentation file: ${filePath}`);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error(`Error downloading documentation: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
