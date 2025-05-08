const router = require('express').Router();
const { analyzeSite } = require('../services/analyzer');
const { buildStyleGuide } = require('../services/styleGuide');

router.post('/', async (req, res) => {
  try {
    const { urls = [] } = req.body;
    if (!urls.length) return res.status(400).json({ error: 'No URLs supplied' });
    
    console.log(`Analyzing ${urls.length} URLs: ${urls.join(', ')}`);
    
    const results = [];
    for (const url of urls) {
      console.log(`Analyzing: ${url}`);
      results.push(await analyzeSite(url));
    }
    
    const styleGuide = buildStyleGuide(results);
    const angularComponents = generateAngularComponents(results);
    
    // Create the response object
    const responseData = {
      analysis: results,
      styleGuide: styleGuide,
      angularComponents: angularComponents
    };
    
    // Save the latest analysis results for use by the CMS integration
    try {
      const fs = require('fs');
      const path = require('path');
      const logsDir = path.join(__dirname, '../logs');
      
      // Ensure logs directory exists
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      // Save the analysis results
      fs.writeFileSync(
        path.join(logsDir, 'latest-analysis.json'),
        JSON.stringify(responseData, null, 2)
      );
      
      console.log('Saved latest analysis results for CMS integration');
    } catch (error) {
      console.error('Error saving analysis results:', error);
    }
    
    res.json(responseData);
  } catch (e) {
    console.error('Analysis error:', e);
    res.status(500).json({ error: 'Analysis failed', message: e.message });
  }
});

function generateAngularComponents(results) {
  // Extract common UI patterns and generate Angular component specs
  const components = [
    {
      name: 'Button',
      selector: 'app-button',
      inputs: ['text: string', 'type: string', 'disabled: boolean'],
      outputs: ['clicked: EventEmitter<any>'],
      template: '<button [ngClass]="type" [disabled]="disabled" (click)="clicked.emit($event)">{{text}}</button>'
    },
    {
      name: 'Card',
      selector: 'app-card',
      inputs: ['title: string', 'subtitle: string'],
      template: '<div class="card"><div class="card-header">{{title}}</div><div class="card-body"><ng-content></ng-content></div></div>'
    },
    {
      name: 'Navigation',
      selector: 'app-nav',
      inputs: ['items: NavItem[]'],
      template: '<nav><ul><li *ngFor="let item of items"><a [routerLink]="item.link">{{item.text}}</a></li></ul></nav>'
    }
  ];
  
  return components;
}

module.exports = router;
