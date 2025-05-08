const axios = require('axios');
const cheerio = require('cheerio');
const chroma = require('chroma-js');
const logger = require('./logger');
const { generateDocs } = require('./docsGenerator');

/**
 * Analyze a website and extract design elements
 * @param {string} url - The URL of the website to analyze
 * @returns {Object} - The extracted design elements
 */
async function analyzeWebsite(url) {
  try {
    logger.info(`Starting analysis of website: ${url}`);
    
    // Fetch the website HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract design elements
    const colors = extractColors($);
    const typography = extractTypography($);
    const components = extractComponents($);
    const layout = analyzeLayout($);
    
    logger.info(`Completed analysis of website: ${url}`);
    
    return {
      url,
      colors,
      typography,
      components,
      layout,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error analyzing website ${url}: ${error.message}`);
    throw new Error(`Failed to analyze website: ${error.message}`);
  }
}

/**
 * Extract color palette from a website
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Extracted color information
 */
function extractColors($) {
  logger.debug('Extracting colors');
  
  const colorMap = new Map();
  const colorProperties = [
    'color', 'background-color', 'border-color', 
    'background', 'border', 'box-shadow', 'fill', 'stroke'
  ];
  
  // Extract inline styles
  $('[style]').each((i, el) => {
    const style = $(el).attr('style');
    colorProperties.forEach(prop => {
      const regex = new RegExp(`${prop}:\\s*([^;]+)`, 'i');
      const match = style?.match(regex);
      if (match && match[1]) {
        try {
          const color = match[1].trim();
          if (isValidColor(color)) {
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
        } catch (e) {
          // Skip invalid colors
        }
      }
    });
  });
  
  // Extract colors from SVG elements
  $('svg [fill], svg [stroke]').each((i, el) => {
    const fill = $(el).attr('fill');
    const stroke = $(el).attr('stroke');
    
    if (fill && fill !== 'none' && fill !== 'transparent') {
      try {
        if (isValidColor(fill)) {
          colorMap.set(fill, (colorMap.get(fill) || 0) + 1);
        }
      } catch (e) {
        // Skip invalid colors
      }
    }
    
    if (stroke && stroke !== 'none' && stroke !== 'transparent') {
      try {
        if (isValidColor(stroke)) {
          colorMap.set(stroke, (colorMap.get(stroke) || 0) + 1);
        }
      } catch (e) {
        // Skip invalid colors
      }
    }
  });
  
  // Extract colors from CSS classes that might contain color information
  const colorClasses = [
    'bg-', 'text-', 'border-', 'btn-', 'alert-', 'badge-', 
    'table-', 'navbar-', 'list-group-item-'
  ];
  
  $('[class]').each((i, el) => {
    const classes = $(el).attr('class').split(/\s+/);
    
    classes.forEach(className => {
      colorClasses.forEach(prefix => {
        if (className.startsWith(prefix)) {
          const colorName = className.substring(prefix.length);
          // Add common color names
          if (['primary', 'secondary', 'success', 'danger', 'warning', 
               'info', 'light', 'dark', 'white', 'black', 'transparent',
               'blue', 'indigo', 'purple', 'pink', 'red', 'orange',
               'yellow', 'green', 'teal', 'cyan', 'gray', 'grey'].includes(colorName)) {
            // We can't determine the exact color value from class names,
            // but we can note that these colors are used
            colorMap.set(`var(--${colorName})`, (colorMap.get(`var(--${colorName})`) || 0) + 1);
          }
        }
      });
    });
  });
  
  // Process the collected colors
  const processedColors = processColors(colorMap);
  
  // Categorize colors
  const luminanceMap = new Map();
  processedColors.forEach(color => {
    try {
      const lum = chroma(color).luminance();
      luminanceMap.set(color, lum);
    } catch (e) {
      // Skip colors that can't be processed by chroma
    }
  });
  
  // Sort by frequency and then categorize
  const sortedColors = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
    .filter(color => {
      try {
        chroma(color);
        return true;
      } catch (e) {
        return false;
      }
    });
  
  // Find the most frequent colors for each category
  const primary = sortedColors.slice(0, 3);
  
  // Find secondary colors (different from primary)
  const secondary = sortedColors
    .filter(color => !primary.includes(color))
    .slice(0, 3);
  
  // Find accent colors (vibrant colors not in primary or secondary)
  const accent = sortedColors
    .filter(color => {
      try {
        const c = chroma(color);
        const s = c.saturate().hex();
        return !primary.includes(color) && 
               !secondary.includes(color) && 
               c.chroma() > 50; // Only vibrant colors
      } catch (e) {
        return false;
      }
    })
    .slice(0, 3);
  
  // Find neutral colors (low saturation, high or low luminance)
  const neutral = sortedColors
    .filter(color => {
      try {
        const c = chroma(color);
        return c.chroma() < 30 && 
              (c.luminance() > 0.7 || c.luminance() < 0.3);
      } catch (e) {
        return false;
      }
    })
    .slice(0, 4);
  
  return {
    primary,
    secondary,
    accent,
    neutral,
    all: processedColors
  };
}

/**
 * Check if a string is a valid CSS color
 * @param {string} color - The color string to check
 * @returns {boolean} - Whether the color is valid
 */
function isValidColor(color) {
  try {
    // Skip transparent, inherit, etc.
    if (['transparent', 'inherit', 'initial', 'currentcolor', 'none'].includes(color.toLowerCase())) {
      return false;
    }
    
    // Try to parse with chroma-js
    chroma(color);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Process and deduplicate colors
 * @param {Map} colorMap - Map of colors and their frequencies
 * @returns {Array} - Processed color array
 */
function processColors(colorMap) {
  // Convert to array and sort by frequency
  const colorEntries = [...colorMap.entries()];
  colorEntries.sort((a, b) => b[1] - a[1]);
  
  // Deduplicate similar colors
  const uniqueColors = [];
  const threshold = 0.15; // Similarity threshold
  
  for (const [color] of colorEntries) {
    // Check if this color is too similar to any already included color
    const isSimilar = uniqueColors.some(existingColor => {
      try {
        const delta = chroma.deltaE(color, existingColor);
        return delta < threshold * 100;
      } catch (e) {
        return false;
      }
    });
    
    if (!isSimilar) {
      uniqueColors.push(color);
    }
  }
  
  return uniqueColors;
}

/**
 * Extract typography information from a website
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Extracted typography information
 */
function extractTypography($) {
  logger.debug('Extracting typography');
  
  const fontFamilies = new Map();
  const fontSizes = new Map();
  const fontWeights = new Map();
  const lineHeights = new Map();
  const letterSpacings = new Map();
  const textTransforms = new Map();
  const textDecorations = new Map();
  
  // Common font family patterns to normalize
  const fontFamilyPatterns = [
    { pattern: /arial/i, normalized: 'Arial, sans-serif' },
    { pattern: /helvetica/i, normalized: 'Helvetica, Arial, sans-serif' },
    { pattern: /times new roman/i, normalized: 'Times New Roman, serif' },
    { pattern: /times/i, normalized: 'Times, serif' },
    { pattern: /courier/i, normalized: 'Courier, monospace' },
    { pattern: /verdana/i, normalized: 'Verdana, sans-serif' },
    { pattern: /georgia/i, normalized: 'Georgia, serif' },
    { pattern: /palatino/i, normalized: 'Palatino, serif' },
    { pattern: /garamond/i, normalized: 'Garamond, serif' },
    { pattern: /bookman/i, normalized: 'Bookman, serif' },
    { pattern: /avant garde/i, normalized: 'Avant Garde, sans-serif' },
    { pattern: /trebuchet/i, normalized: 'Trebuchet MS, sans-serif' },
    { pattern: /impact/i, normalized: 'Impact, sans-serif' },
    { pattern: /comic sans/i, normalized: 'Comic Sans MS, cursive' },
    { pattern: /roboto/i, normalized: 'Roboto, sans-serif' },
    { pattern: /open sans/i, normalized: 'Open Sans, sans-serif' },
    { pattern: /lato/i, normalized: 'Lato, sans-serif' },
    { pattern: /montserrat/i, normalized: 'Montserrat, sans-serif' },
    { pattern: /raleway/i, normalized: 'Raleway, sans-serif' },
    { pattern: /poppins/i, normalized: 'Poppins, sans-serif' },
    { pattern: /nunito/i, normalized: 'Nunito, sans-serif' },
    { pattern: /playfair/i, normalized: 'Playfair Display, serif' },
    { pattern: /merriweather/i, normalized: 'Merriweather, serif' },
    { pattern: /ubuntu/i, normalized: 'Ubuntu, sans-serif' },
    { pattern: /source sans/i, normalized: 'Source Sans Pro, sans-serif' },
    { pattern: /source serif/i, normalized: 'Source Serif Pro, serif' },
    { pattern: /source code/i, normalized: 'Source Code Pro, monospace' },
    { pattern: /fira/i, normalized: 'Fira Sans, sans-serif' },
    { pattern: /noto/i, normalized: 'Noto Sans, sans-serif' },
    { pattern: /pt sans/i, normalized: 'PT Sans, sans-serif' },
    { pattern: /pt serif/i, normalized: 'PT Serif, serif' },
    { pattern: /muli/i, normalized: 'Muli, sans-serif' },
    { pattern: /titillium/i, normalized: 'Titillium Web, sans-serif' },
    { pattern: /karla/i, normalized: 'Karla, sans-serif' },
    { pattern: /inter/i, normalized: 'Inter, sans-serif' },
    { pattern: /sans-serif/i, normalized: 'sans-serif' },
    { pattern: /serif/i, normalized: 'serif' },
    { pattern: /monospace/i, normalized: 'monospace' },
    { pattern: /cursive/i, normalized: 'cursive' },
    { pattern: /fantasy/i, normalized: 'fantasy' },
    { pattern: /system-ui/i, normalized: 'system-ui' }
  ];
  
  // Normalize font family
  function normalizeFontFamily(fontFamily) {
    // Remove quotes and extra spaces
    let normalized = fontFamily.replace(/['"]/g, '').trim();
    
    // Check for common patterns
    for (const { pattern, normalized: norm } of fontFamilyPatterns) {
      if (pattern.test(normalized)) {
        return norm;
      }
    }
    
    // If no match, return as is
    return normalized;
  }
  
  // Extract inline styles
  $('[style]').each((i, el) => {
    const style = $(el).attr('style');
    
    // Font family
    const fontFamilyMatch = style?.match(/font-family:\s*([^;]+)/i);
    if (fontFamilyMatch && fontFamilyMatch[1]) {
      const fontFamily = normalizeFontFamily(fontFamilyMatch[1]);
      fontFamilies.set(fontFamily, (fontFamilies.get(fontFamily) || 0) + 1);
    }
    
    // Font size
    const fontSizeMatch = style?.match(/font-size:\s*([^;]+)/i);
    if (fontSizeMatch && fontSizeMatch[1]) {
      const fontSize = fontSizeMatch[1].trim();
      fontSizes.set(fontSize, (fontSizes.get(fontSize) || 0) + 1);
    }
    
    // Font weight
    const fontWeightMatch = style?.match(/font-weight:\s*([^;]+)/i);
    if (fontWeightMatch && fontWeightMatch[1]) {
      const fontWeight = fontWeightMatch[1].trim();
      fontWeights.set(fontWeight, (fontWeights.get(fontWeight) || 0) + 1);
    }
    
    // Line height
    const lineHeightMatch = style?.match(/line-height:\s*([^;]+)/i);
    if (lineHeightMatch && lineHeightMatch[1]) {
      const lineHeight = lineHeightMatch[1].trim();
      lineHeights.set(lineHeight, (lineHeights.get(lineHeight) || 0) + 1);
    }
    
    // Letter spacing
    const letterSpacingMatch = style?.match(/letter-spacing:\s*([^;]+)/i);
    if (letterSpacingMatch && letterSpacingMatch[1]) {
      const letterSpacing = letterSpacingMatch[1].trim();
      letterSpacings.set(letterSpacing, (letterSpacings.get(letterSpacing) || 0) + 1);
    }
    
    // Text transform
    const textTransformMatch = style?.match(/text-transform:\s*([^;]+)/i);
    if (textTransformMatch && textTransformMatch[1]) {
      const textTransform = textTransformMatch[1].trim();
      textTransforms.set(textTransform, (textTransforms.get(textTransform) || 0) + 1);
    }
    
    // Text decoration
    const textDecorationMatch = style?.match(/text-decoration:\s*([^;]+)/i);
    if (textDecorationMatch && textDecorationMatch[1]) {
      const textDecoration = textDecorationMatch[1].trim();
      textDecorations.set(textDecoration, (textDecorations.get(textDecoration) || 0) + 1);
    }
  });
  
  // Extract font-related CSS classes
  const fontClasses = [
    'font-', 'text-', 'fs-', 'fw-', 'lh-', 'ls-', 'tt-', 'td-'
  ];
  
  $('[class]').each((i, el) => {
    const classes = $(el).attr('class').split(/\s+/);
    
    classes.forEach(className => {
      // Font weight classes (Bootstrap-like)
      if (/^fw-/.test(className)) {
        const weight = className.substring(3);
        if (['light', 'normal', 'bold', 'bolder', 'semibold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(weight)) {
          fontWeights.set(weight, (fontWeights.get(weight) || 0) + 1);
        }
      }
      
      // Font size classes (Bootstrap-like)
      if (/^fs-/.test(className)) {
        const size = className.substring(3);
        if (['1', '2', '3', '4', '5', '6', 'sm', 'md', 'lg', 'xl'].includes(size)) {
          fontSizes.set(`var(--fs-${size})`, (fontSizes.get(`var(--fs-${size})`) || 0) + 1);
        }
      }
      
      // Text transform classes
      if (/^text-(?:uppercase|lowercase|capitalize)$/.test(className)) {
        const transform = className.substring(5);
        textTransforms.set(transform, (textTransforms.get(transform) || 0) + 1);
      }
    });
  });
  
  // Extract heading styles
  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const tagName = $(el).prop('tagName').toLowerCase();
    const headingLevel = parseInt(tagName.substring(1));
    
    // Store the heading level count
    fontWeights.set(`heading-${headingLevel}`, (fontWeights.get(`heading-${headingLevel}`) || 0) + 1);
    
    // Extract font family from computed style if available
    const fontFamily = $(el).css('font-family');
    if (fontFamily) {
      const normalizedFontFamily = normalizeFontFamily(fontFamily);
      fontFamilies.set(normalizedFontFamily, (fontFamilies.get(normalizedFontFamily) || 0) + 1);
    }
    
    // Extract font size from computed style if available
    const fontSize = $(el).css('font-size');
    if (fontSize) {
      fontSizes.set(fontSize, (fontSizes.get(fontSize) || 0) + 1);
    }
  });
  
  // Extract font information from link tags (Google Fonts, etc.)
  $('link[rel="stylesheet"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('fonts.googleapis.com')) {
      // Extract font family from Google Fonts URL
      const fontMatch = href.match(/family=([^&:]+)/);
      if (fontMatch && fontMatch[1]) {
        const fontFamily = fontMatch[1].replace(/\+/g, ' ');
        const normalizedFontFamily = normalizeFontFamily(fontFamily);
        fontFamilies.set(normalizedFontFamily, (fontFamilies.get(normalizedFontFamily) || 0) + 10); // Give higher weight to linked fonts
      }
    }
  });
  
  // Process the collected typography data
  return {
    fontFamilies: sortMapByFrequency(fontFamilies),
    fontSizes: sortMapByFrequency(fontSizes),
    fontWeights: sortMapByFrequency(fontWeights),
    lineHeights: sortMapByFrequency(lineHeights),
    letterSpacings: sortMapByFrequency(letterSpacings),
    textTransforms: sortMapByFrequency(textTransforms),
    textDecorations: sortMapByFrequency(textDecorations),
    headings: {
      h1: extractHeadingStyle($, 'h1'),
      h2: extractHeadingStyle($, 'h2'),
      h3: extractHeadingStyle($, 'h3'),
      h4: extractHeadingStyle($, 'h4'),
      h5: extractHeadingStyle($, 'h5'),
      h6: extractHeadingStyle($, 'h6')
    }
  };
}

/**
 * Extract heading style information
 * @param {Object} $ - Cheerio instance
 * @param {string} selector - Heading selector (h1, h2, etc.)
 * @returns {Object} - Heading style information
 */
function extractHeadingStyle($, selector) {
  const elements = $(selector);
  if (elements.length === 0) return null;
  
  // Just return the count for now
  return {
    count: elements.length
  };
}

/**
 * Sort a map by frequency and return keys
 * @param {Map} map - Map to sort
 * @returns {Array} - Sorted keys
 */
function sortMapByFrequency(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ value: key, count }));
}

/**
 * Extract components from a website
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Extracted component information
 */
function extractComponents($) {
  logger.debug('Extracting components');
  
  // Common component selectors
  const componentSelectors = {
    buttons: 'button, .btn, [class*="button"], [type="button"], [type="submit"]',
    forms: 'form',
    inputs: 'input, textarea, select',
    navigation: 'nav, [class*="nav"], [class*="menu"]',
    cards: '[class*="card"]',
    modals: '[class*="modal"], [class*="dialog"]',
    tables: 'table',
    lists: 'ul, ol',
    images: 'img',
    icons: 'i, [class*="icon"]',
    headers: 'header, [class*="header"]',
    footers: 'footer, [class*="footer"]',
    sidebars: 'aside, [class*="sidebar"], [class*="side-bar"]'
  };
  
  const components = {};
  
  // Count components
  for (const [component, selector] of Object.entries(componentSelectors)) {
    const elements = $(selector);
    components[component] = {
      count: elements.length,
      examples: elements.length > 0 ? extractComponentExamples($, elements) : []
    };
  }
  
  return components;
}

/**
 * Extract component examples
 * @param {Object} $ - Cheerio instance
 * @param {Object} elements - Cheerio elements
 * @returns {Array} - Component examples
 */
function extractComponentExamples($, elements) {
  const examples = [];
  
  // Take up to 3 examples
  elements.slice(0, 3).each((i, el) => {
    const element = $(el);
    const classes = element.attr('class') || '';
    const id = element.attr('id') || '';
    
    examples.push({
      tag: element.prop('tagName').toLowerCase(),
      classes: classes.split(/\s+/).filter(Boolean),
      id: id,
      text: element.text().trim().substring(0, 50) + (element.text().length > 50 ? '...' : '')
    });
  });
  
  return examples;
}

/**
 * Analyze layout of a website
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Layout analysis
 */
function analyzeLayout($) {
  logger.debug('Analyzing layout');
  
  // Layout patterns to detect
  const layoutPatterns = {
    containers: {
      selectors: [
        '[class*="container"]',
        '[class*="wrapper"]',
        '[class*="content"]',
        'main',
        'section',
        'article'
      ],
      count: 0,
      examples: []
    },
    grids: {
      selectors: [
        '[class*="grid"]',
        '[class*="row"]',
        '[class*="cols"]',
        '[class*="columns"]',
        '[style*="display: grid"]',
        '[style*="display:grid"]'
      ],
      count: 0,
      examples: []
    },
    flexContainers: {
      selectors: [
        '[class*="flex"]',
        '[class*="d-flex"]',
        '[style*="display: flex"]',
        '[style*="display:flex"]'
      ],
      count: 0,
      examples: []
    },
    responsiveLayouts: {
      selectors: [
        '[class*="col-"]',
        '[class*="sm-"]',
        '[class*="md-"]',
        '[class*="lg-"]',
        '[class*="xl-"]',
        '[class*="mobile-"]',
        '[class*="tablet-"]',
        '[class*="desktop-"]'
      ],
      count: 0,
      examples: []
    },
    positioning: {
      selectors: [
        '[style*="position: absolute"]',
        '[style*="position:absolute"]',
        '[style*="position: relative"]',
        '[style*="position:relative"]',
        '[style*="position: fixed"]',
        '[style*="position:fixed"]',
        '[style*="position: sticky"]',
        '[style*="position:sticky"]'
      ],
      count: 0,
      examples: []
    },
    zIndex: {
      selectors: [
        '[style*="z-index:"]'
      ],
      count: 0,
      examples: []
    }
  };
  
  // Detect CSS frameworks
  const cssFrameworks = {
    bootstrap: {
      selectors: [
        '.container',
        '.row',
        '.col',
        '.navbar',
        '.card',
        '.btn',
        '.alert',
        '.badge'
      ],
      detected: false,
      version: null,
      confidence: 0
    },
    tailwind: {
      selectors: [
        '[class*="flex"]',
        '[class*="grid"]',
        '[class*="text-"]',
        '[class*="bg-"]',
        '[class*="p-"]',
        '[class*="m-"]',
        '[class*="w-"]',
        '[class*="h-"]'
      ],
      detected: false,
      version: null,
      confidence: 0
    },
    foundation: {
      selectors: [
        '.grid-container',
        '.grid-x',
        '.cell',
        '.button',
        '.callout',
        '.top-bar'
      ],
      detected: false,
      version: null,
      confidence: 0
    },
    bulma: {
      selectors: [
        '.container',
        '.columns',
        '.column',
        '.navbar',
        '.button',
        '.notification',
        '.box'
      ],
      detected: false,
      version: null,
      confidence: 0
    },
    materialize: {
      selectors: [
        '.container',
        '.row',
        '.col',
        '.card',
        '.btn',
        '.navbar',
        '.sidenav'
      ],
      detected: false,
      version: null,
      confidence: 0
    }
  };
  
  // Process layout patterns
  for (const [patternName, pattern] of Object.entries(layoutPatterns)) {
    let elements = $();
    
    // Combine all selectors for this pattern
    pattern.selectors.forEach(selector => {
      elements = elements.add($(selector));
    });
    
    // Count unique elements
    const uniqueElements = new Set();
    elements.each((i, el) => {
      uniqueElements.add(el);
    });
    
    pattern.count = uniqueElements.size;
    
    // Extract examples
    if (uniqueElements.size > 0) {
      const examples = [];
      let i = 0;
      
      uniqueElements.forEach(el => {
        if (i < 3) { // Limit to 3 examples
          const $el = $(el);
          examples.push({
            tag: $el.prop('tagName')?.toLowerCase() || 'unknown',
            classes: ($el.attr('class') || '').split(/\s+/).filter(Boolean),
            id: $el.attr('id') || null,
            children: $el.children().length
          });
          i++;
        }
      });
      
      pattern.examples = examples;
    }
  }
  
  // Detect CSS frameworks
  for (const [frameworkName, framework] of Object.entries(cssFrameworks)) {
    let matchCount = 0;
    const totalSelectors = framework.selectors.length;
    
    framework.selectors.forEach(selector => {
      if ($(selector).length > 0) {
        matchCount++;
      }
    });
    
    // Calculate confidence score (0-100)
    const confidence = Math.round((matchCount / totalSelectors) * 100);
    
    framework.confidence = confidence;
    framework.detected = confidence > 30; // Consider detected if confidence > 30%
    
    // Try to detect version from meta tags or comments
    const versionComment = $('*:contains("v")').filter(function() {
      return this.nodeType === 8 && 
             this.nodeValue.toLowerCase().includes(frameworkName) && 
             this.nodeValue.match(/v\d+\.\d+/);
    });
    
    if (versionComment.length > 0) {
      const versionMatch = versionComment.text().match(/v(\d+\.\d+(\.\d+)?)/);
      if (versionMatch) {
        framework.version = versionMatch[1];
      }
    }
    
    // Check for CSS framework links
    $('link[rel="stylesheet"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.toLowerCase().includes(frameworkName)) {
        const versionMatch = href.match(/(\d+\.\d+(\.\d+)?)/);
        if (versionMatch) {
          framework.version = versionMatch[1];
        }
      }
    });
  }
  
  // Analyze responsive design
  const mediaQueries = {
    detected: false,
    breakpoints: []
  };
  
  // Check for responsive meta tag
  const viewportMeta = $('meta[name="viewport"]');
  if (viewportMeta.length > 0) {
    mediaQueries.detected = true;
    mediaQueries.viewportMeta = viewportMeta.attr('content');
  }
  
  // Analyze page structure
  const pageStructure = {
    hasHeader: $('header').length > 0 || $('[class*="header"]').length > 0,
    hasFooter: $('footer').length > 0 || $('[class*="footer"]').length > 0,
    hasNavigation: $('nav').length > 0 || $('[class*="nav"]').length > 0 || $('[class*="menu"]').length > 0,
    hasSidebar: $('aside').length > 0 || $('[class*="sidebar"]').length > 0 || $('[class*="side-bar"]').length > 0,
    hasMain: $('main').length > 0,
    sections: $('section').length
  };
  
  return {
    patterns: layoutPatterns,
    frameworks: cssFrameworks,
    responsive: mediaQueries,
    pageStructure: pageStructure
  };
}

/**
 * Generate a style guide based on multiple website analyses
 * @param {Array} analyses - Array of website analyses
 * @returns {Object} - Generated style guide
 */
function generateStyleGuide(analyses) {
  logger.info(`Generating style guide from ${analyses.length} website analyses`);
  
  // Combine colors from all analyses
  const allColors = analyses.flatMap(analysis => analysis.colors.all || []);
  const allPrimaryColors = analyses.flatMap(analysis => analysis.colors.primary || []);
  const allSecondaryColors = analyses.flatMap(analysis => analysis.colors.secondary || []);
  const allAccentColors = analyses.flatMap(analysis => analysis.colors.accent || []);
  const allNeutralColors = analyses.flatMap(analysis => analysis.colors.neutral || []);
  
  // Combine typography from all analyses
  const allFontFamilies = analyses.flatMap(analysis => analysis.typography.fontFamilies || []);
  const allFontSizes = analyses.flatMap(analysis => analysis.typography.fontSizes || []);
  const allFontWeights = analyses.flatMap(analysis => analysis.typography.fontWeights || []);
  const allLineHeights = analyses.flatMap(analysis => analysis.typography.lineHeights || []);
  const allLetterSpacings = analyses.flatMap(analysis => analysis.typography.letterSpacings || []);
  const allTextTransforms = analyses.flatMap(analysis => analysis.typography.textTransforms || []);
  
  // Combine layout information
  const layoutFrameworks = analyses.map(analysis => {
    if (!analysis.layout || !analysis.layout.frameworks) return null;
    
    // Find the framework with the highest confidence
    let highestConfidence = 0;
    let detectedFramework = null;
    
    for (const [name, framework] of Object.entries(analysis.layout.frameworks)) {
      if (framework.confidence > highestConfidence) {
        highestConfidence = framework.confidence;
        detectedFramework = { name, ...framework };
      }
    }
    
    return detectedFramework;
  }).filter(Boolean);
  
  // Determine the most common CSS framework
  const frameworkCounts = {};
  layoutFrameworks.forEach(framework => {
    frameworkCounts[framework.name] = (frameworkCounts[framework.name] || 0) + 1;
  });
  
  let recommendedFramework = null;
  let maxCount = 0;
  
  for (const [name, count] of Object.entries(frameworkCounts)) {
    if (count > maxCount) {
      maxCount = count;
      recommendedFramework = name;
    }
  }
  
  // Generate color palette
  const colorPalette = {
    primary: selectMostCommon(allPrimaryColors.length > 0 ? allPrimaryColors : allColors, 3),
    secondary: selectMostCommon(allSecondaryColors.length > 0 ? allSecondaryColors : allColors.slice(3), 3),
    accent: selectMostCommon(allAccentColors.length > 0 ? allAccentColors : allColors.slice(6), 2),
    neutral: selectMostCommon(
      allNeutralColors.length > 0 ? allNeutralColors : 
      allColors.filter(c => {
        try {
          const color = chroma(c);
          return color.luminance() > 0.8 || color.luminance() < 0.2;
        } catch (e) {
          return false;
        }
      }), 
      4
    )
  };
  
  // Generate shades for primary and secondary colors
  const colorShades = {};
  
  // Generate shades for primary color
  if (colorPalette.primary.length > 0) {
    try {
      const primaryBase = chroma(colorPalette.primary[0]);
      colorShades.primary = {
        50: primaryBase.luminance(0.95).hex(),
        100: primaryBase.luminance(0.9).hex(),
        200: primaryBase.luminance(0.8).hex(),
        300: primaryBase.luminance(0.7).hex(),
        400: primaryBase.luminance(0.6).hex(),
        500: primaryBase.hex(), // Base color
        600: primaryBase.luminance(0.4).hex(),
        700: primaryBase.luminance(0.3).hex(),
        800: primaryBase.luminance(0.2).hex(),
        900: primaryBase.luminance(0.1).hex()
      };
    } catch (e) {
      // Fallback if color manipulation fails
      colorShades.primary = {};
    }
  }
  
  // Generate shades for secondary color
  if (colorPalette.secondary.length > 0) {
    try {
      const secondaryBase = chroma(colorPalette.secondary[0]);
      colorShades.secondary = {
        50: secondaryBase.luminance(0.95).hex(),
        100: secondaryBase.luminance(0.9).hex(),
        200: secondaryBase.luminance(0.8).hex(),
        300: secondaryBase.luminance(0.7).hex(),
        400: secondaryBase.luminance(0.6).hex(),
        500: secondaryBase.hex(), // Base color
        600: secondaryBase.luminance(0.4).hex(),
        700: secondaryBase.luminance(0.3).hex(),
        800: secondaryBase.luminance(0.2).hex(),
        900: secondaryBase.luminance(0.1).hex()
      };
    } catch (e) {
      // Fallback if color manipulation fails
      colorShades.secondary = {};
    }
  }
  
  // Generate the style guide
  const styleGuide = {
    colors: {
      palette: colorPalette,
      shades: colorShades,
      semantic: {
        success: '#28a745',
        info: '#17a2b8',
        warning: '#ffc107',
        danger: '#dc3545'
      }
    },
    typography: {
      fontFamilies: selectMostCommonFromObjects(allFontFamilies, 'value', 3),
      fontSizes: generateFontSizeScale(selectMostCommonFromObjects(allFontSizes, 'value')),
      fontWeights: selectMostCommonFromObjects(allFontWeights, 'value', 3),
      lineHeights: generateLineHeightScale(selectMostCommonFromObjects(allLineHeights, 'value')),
      letterSpacings: selectMostCommonFromObjects(allLetterSpacings, 'value', 3),
      textTransforms: selectMostCommonFromObjects(allTextTransforms, 'value', 3),
      headings: {
        h1: { fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2', marginBottom: '0.5em' },
        h2: { fontSize: '2rem', fontWeight: '700', lineHeight: '1.2', marginBottom: '0.5em' },
        h3: { fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2', marginBottom: '0.5em' },
        h4: { fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.2', marginBottom: '0.5em' },
        h5: { fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.2', marginBottom: '0.5em' },
        h6: { fontSize: '1rem', fontWeight: '700', lineHeight: '1.2', marginBottom: '0.5em' }
      },
      paragraphs: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.5',
        marginBottom: '1em'
      }
    },
    components: generateComponentSpecs(analyses),
    layout: {
      grid: {
        columns: 12,
        gutter: '1rem'
      },
      containers: {
        sm: '540px',
        md: '720px',
        lg: '960px',
        xl: '1140px',
        xxl: '1320px'
      },
      recommendedFramework: recommendedFramework
    },
    spacing: generateSpacingScale(),
    breakpoints: {
      xs: '0px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1400px'
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    borders: {
      radius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '1rem',
        pill: '50rem'
      },
      width: {
        thin: '1px',
        medium: '2px',
        thick: '4px'
      }
    },
    animations: {
      durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easings: {
        default: 'ease',
        in: 'ease-in',
        out: 'ease-out',
        inOut: 'ease-in-out'
      }
    },
    cssVariables: generateCSSVariables({
      colors: colorPalette,
      colorShades: colorShades,
      spacing: generateSpacingScale()
    }),
    htmlPreview: generateHTMLPreview({
      colors: colorPalette,
      typography: {
        fontFamilies: selectMostCommonFromObjects(allFontFamilies, 'value', 2),
        fontSizes: generateFontSizeScale(selectMostCommonFromObjects(allFontSizes, 'value'))
      }
    })
  };
  
  // Generate documentation
  logger.info('Generating documentation for style guide');
  const documentation = generateDocs(styleGuide);
  styleGuide.documentation = documentation;
  
  return styleGuide;
}

/**
 * Generate a line height scale
 * @param {Array} lineHeights - Array of line heights
 * @returns {Object} - Line height scale
 */
function generateLineHeightScale(lineHeights) {
  // Default scale if we can't extract enough information
  const defaultScale = {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  };
  
  // If we don't have enough line heights, return the default scale
  if (!lineHeights || lineHeights.length < 3) {
    return defaultScale;
  }
  
  // Try to extract a scale from the line heights
  // This is a simplified approach
  return defaultScale;
}

/**
 * Generate CSS variables based on the style guide
 * @param {Object} styleGuide - Style guide object
 * @returns {String} - CSS variables
 */
function generateCSSVariables({ colors, colorShades, spacing }) {
  let cssVars = ':root {\n';
  
  // Add color variables
  for (const [type, colorArray] of Object.entries(colors)) {
    colorArray.forEach((color, index) => {
      try {
        cssVars += `  --color-${type}-${index + 1}: ${color};\n`;
      } catch (e) {
        // Skip invalid colors
      }
    });
  }
  
  // Add color shade variables
  for (const [type, shades] of Object.entries(colorShades)) {
    for (const [shade, color] of Object.entries(shades)) {
      cssVars += `  --color-${type}-${shade}: ${color};\n`;
    }
  }
  
  // Add spacing variables
  for (const [key, value] of Object.entries(spacing)) {
    cssVars += `  --spacing-${key}: ${value};\n`;
  }
  
  cssVars += '}\n';
  return cssVars;
}

/**
 * Generate HTML preview of the style guide
 * @param {Object} styleGuide - Style guide object
 * @returns {String} - HTML preview
 */
function generateHTMLPreview({ colors, typography }) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Style Guide Preview</title>
  <style>
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${typography.fontFamilies[0]?.value || 'sans-serif'};
      line-height: 1.5;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 1rem;
    }
    
    section {
      margin-bottom: 3rem;
    }
    
    .color-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .color-swatch {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .color-display {
      flex: 1;
    }
    
    .color-info {
      background-color: #f8f9fa;
      padding: 0.5rem;
      font-size: 0.8rem;
      text-align: center;
    }
    
    .typography-sample {
      margin-bottom: 2rem;
    }
    
    .font-sample {
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    .component-example {
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    .button {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      cursor: pointer;
    }
    
    .button-primary {
      color: #fff;
      background-color: ${colors.primary[0] || '#007bff'};
      border-color: ${colors.primary[0] || '#007bff'};
    }
    
    .button-secondary {
      color: #fff;
      background-color: ${colors.secondary[0] || '#6c757d'};
      border-color: ${colors.secondary[0] || '#6c757d'};
    }
    
    .button-accent {
      color: #fff;
      background-color: ${colors.accent[0] || '#fd7e14'};
      border-color: ${colors.accent[0] || '#fd7e14'};
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Style Guide Preview</h1>
    
    <section>
      <h2>Colors</h2>
      
      <h3>Primary Colors</h3>
      <div class="color-palette">
        ${colors.primary.map(color => `
          <div class="color-swatch">
            <div class="color-display" style="background-color: ${color};"></div>
            <div class="color-info">${color}</div>
          </div>
        `).join('')}
      </div>
      
      <h3>Secondary Colors</h3>
      <div class="color-palette">
        ${colors.secondary.map(color => `
          <div class="color-swatch">
            <div class="color-display" style="background-color: ${color};"></div>
            <div class="color-info">${color}</div>
          </div>
        `).join('')}
      </div>
      
      <h3>Accent Colors</h3>
      <div class="color-palette">
        ${colors.accent.map(color => `
          <div class="color-swatch">
            <div class="color-display" style="background-color: ${color};"></div>
            <div class="color-info">${color}</div>
          </div>
        `).join('')}
      </div>
      
      <h3>Neutral Colors</h3>
      <div class="color-palette">
        ${colors.neutral.map(color => `
          <div class="color-swatch">
            <div class="color-display" style="background-color: ${color};"></div>
            <div class="color-info">${color}</div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <section>
      <h2>Typography</h2>
      
      <div class="typography-sample">
        <h3>Font Families</h3>
        ${typography.fontFamilies.map(font => `
          <div class="font-sample" style="font-family: ${font.value};">
            <p><strong>Font Family:</strong> ${font.value}</p>
            <p>The quick brown fox jumps over the lazy dog.</p>
            <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            <p>abcdefghijklmnopqrstuvwxyz</p>
            <p>1234567890</p>
          </div>
        `).join('')}
      </div>
      
      <div class="typography-sample">
        <h3>Headings</h3>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      </div>
      
      <div class="typography-sample">
        <h3>Paragraph</h3>
        <p>This is a paragraph of text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.</p>
      </div>
    </section>
    
    <section>
      <h2>Components</h2>
      
      <div class="component-example">
        <h3>Buttons</h3>
        <button class="button button-primary">Primary Button</button>
        <button class="button button-secondary">Secondary Button</button>
        <button class="button button-accent">Accent Button</button>
      </div>
    </section>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Select the most common items from an array
 * @param {Array} items - Array of items
 * @param {number} count - Number of items to select
 * @returns {Array} - Most common items
 */
function selectMostCommon(items, count = 5) {
  const frequency = new Map();
  
  // Count frequency
  items.forEach(item => {
    frequency.set(item, (frequency.get(item) || 0) + 1);
  });
  
  // Sort by frequency
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([item]) => item);
}

/**
 * Select the most common items from an array of objects
 * @param {Array} items - Array of objects
 * @param {string} key - Key to compare
 * @param {number} count - Number of items to select
 * @returns {Array} - Most common items
 */
function selectMostCommonFromObjects(items, key, count = 5) {
  const frequency = new Map();
  
  // Count frequency
  items.forEach(item => {
    const value = item[key];
    frequency.set(value, (frequency.get(value) || 0) + item.count || 1);
  });
  
  // Sort by frequency
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([value, count]) => ({ value, count }));
}

/**
 * Generate a font size scale
 * @param {Array} fontSizes - Array of font sizes
 * @returns {Object} - Font size scale
 */
function generateFontSizeScale(fontSizes) {
  // Default scale if we can't extract enough information
  const defaultScale = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  };
  
  // If we don't have enough font sizes, return the default scale
  if (fontSizes.length < 5) {
    return defaultScale;
  }
  
  // Try to extract a scale from the font sizes
  // This is a simplified approach
  return defaultScale;
}

/**
 * Generate component specifications
 * @param {Array} analyses - Array of website analyses
 * @returns {Object} - Component specifications
 */
function generateComponentSpecs(analyses) {
  // Combine component information from all analyses
  const componentTypes = [
    'buttons', 'forms', 'inputs', 'navigation', 
    'cards', 'modals', 'tables', 'lists'
  ];
  
  const componentSpecs = {};
  
  componentTypes.forEach(type => {
    // Get examples from all analyses
    const allExamples = analyses.flatMap(analysis => 
      analysis.components[type]?.examples || []
    );
    
    // Generate specs based on examples
    componentSpecs[type] = {
      count: analyses.reduce((sum, analysis) => sum + (analysis.components[type]?.count || 0), 0),
      examples: allExamples.slice(0, 3),
      angularComponent: generateAngularComponentSpec(type, allExamples)
    };
  });
  
  return componentSpecs;
}

/**
 * Generate Angular component specification
 * @param {string} type - Component type
 * @param {Array} examples - Component examples
 * @returns {Object} - Angular component specification
 */
function generateAngularComponentSpec(type, examples) {
  // This is a simplified approach
  // In a real implementation, we would analyze the examples more thoroughly
  
  const componentName = type.charAt(0).toUpperCase() + type.slice(1, -1);
  
  return {
    selector: `app-${type.slice(0, -1)}`,
    componentName: `${componentName}Component`,
    inputs: [
      { name: 'variant', type: 'string', description: 'Component variant (primary, secondary, etc.)' },
      { name: 'size', type: 'string', description: 'Component size (sm, md, lg, etc.)' },
      { name: 'disabled', type: 'boolean', description: 'Whether the component is disabled' }
    ],
    outputs: [
      { name: 'click', type: 'EventEmitter<any>', description: 'Emitted when the component is clicked' }
    ]
  };
}

/**
 * Generate a spacing scale
 * @returns {Object} - Spacing scale
 */
function generateSpacingScale() {
  return {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '32': '8rem',
    '40': '10rem',
    '48': '12rem',
    '56': '14rem',
    '64': '16rem'
  };
}

module.exports = {
  analyzeWebsite,
  generateStyleGuide
};
