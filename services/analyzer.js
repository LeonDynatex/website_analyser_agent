const puppeteer = require('puppeteer');

async function analyzeSite(url) {

  console.log(`Starting analysis for ${url}`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Extract design elements
    const designData = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('body *')].slice(0, 300);
      
      // Extract colors
      const colors = new Set();
      const backgroundColors = new Set();
      const borderColors = new Set();
      
      // Extract typography
      const fonts = new Set();
      const fontSizes = new Set();
      const fontWeights = new Set();
      
      // Extract spacing
      const margins = new Set();
      const paddings = new Set();
      
      // Extract components
      const buttons = [];
      const inputs = [];
      const cards = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        // Colors
        if (style.color && style.color !== 'rgba(0, 0, 0, 0)') colors.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') backgroundColors.add(style.backgroundColor);
        if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') borderColors.add(style.borderColor);
        
        // Typography
        if (style.fontFamily) fonts.add(style.fontFamily);
        if (style.fontSize) fontSizes.add(style.fontSize);
        if (style.fontWeight) fontWeights.add(style.fontWeight);
        
        // Spacing
        if (style.margin && style.margin !== '0px') margins.add(style.margin);
        if (style.padding && style.padding !== '0px') paddings.add(style.padding);
        
        // Components
        if (el.tagName === 'BUTTON' || (el.tagName === 'A' && style.display.includes('inline-block'))) {
          buttons.push({
            text: el.innerText,
            backgroundColor: style.backgroundColor,
            color: style.color,
            padding: style.padding,
            borderRadius: style.borderRadius,
            fontSize: style.fontSize
          });
        }
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          inputs.push({
            type: el.type || 'text',
            placeholder: el.placeholder,
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            padding: style.padding,
            borderRadius: style.borderRadius
          });
        }
        
        // Detect card-like components
        if (style.boxShadow && style.boxShadow !== 'none' && el.children.length > 0) {
          cards.push({
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow,
            padding: style.padding
          });
        }
      });
      
      return {
        colors: [...colors].filter(c => c !== 'rgb(0, 0, 0)' && c !== 'rgb(255, 255, 255)'),
        backgroundColors: [...backgroundColors].filter(c => c !== 'rgb(0, 0, 0)' && c !== 'rgb(255, 255, 255)'),
        borderColors: [...borderColors].filter(c => c !== 'rgb(0, 0, 0)' && c !== 'rgb(255, 255, 255)'),
        typography: {
          fonts: [...fonts],
          fontSizes: [...fontSizes],
          fontWeights: [...fontWeights]
        },
        spacing: {
          margins: [...margins],
          paddings: [...paddings]
        },
        components: {
          buttons: buttons.slice(0, 5), // Limit to 5 examples
          inputs: inputs.slice(0, 5),
          cards: cards.slice(0, 3)
        }
      };
    });
    
    // Get page title and meta description
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
    
    // Take a screenshot
    const screenshotBuffer = await page.screenshot();
    const screenshotBase64 = screenshotBuffer.toString('base64');
    
    return {
      url,
      title,
      description,
      screenshot: `data:image/png;base64,${screenshotBase64}`,
      designElements: designData
    };
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error);
    throw error;
  } finally {
    await browser.close();
    console.log(`Completed analysis for ${url}`);
  }
}

module.exports = { analyzeSite };
