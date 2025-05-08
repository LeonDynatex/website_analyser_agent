function buildStyleGuide(results) {
  // Aggregate all design elements from the analyzed sites
  const allColors = new Set();
  const allBackgroundColors = new Set();
  const allBorderColors = new Set();
  const allFonts = new Set();
  const allFontSizes = new Set();
  const allFontWeights = new Set();
  const allButtons = [];
  const allInputs = [];
  const allCards = [];
  
  results.forEach(result => {
    const elements = result.designElements;
    
    // Add colors
    elements.colors.forEach(c => allColors.add(c));
    elements.backgroundColors.forEach(c => allBackgroundColors.add(c));
    elements.borderColors.forEach(c => allBorderColors.add(c));
    
    // Add typography
    elements.typography.fonts.forEach(f => allFonts.add(f));
    elements.typography.fontSizes.forEach(s => allFontSizes.add(s));
    elements.typography.fontWeights.forEach(w => allFontWeights.add(w));
    
    // Add components
    allButtons.push(...elements.components.buttons);
    allInputs.push(...elements.components.inputs);
    allCards.push(...elements.components.cards);
  });
  
  // Generate color palette (primary, secondary, accent, etc.)
  const colorPalette = generateColorPalette([...allColors, ...allBackgroundColors, ...allBorderColors]);
  
  // Generate typography system
  const typographySystem = {
    fontFamilies: [...allFonts],
    fontSizes: [...allFontSizes].sort((a, b) => {
      return parseInt(a) - parseInt(b);
    }),
    fontWeights: [...allFontWeights].sort((a, b) => {
      return parseInt(a) - parseInt(b);
    })
  };
  
  // Generate component styles
  const componentStyles = {
    buttons: selectRepresentativeStyles(allButtons),
    inputs: selectRepresentativeStyles(allInputs),
    cards: selectRepresentativeStyles(allCards)
  };
  
  // Generate CSS variables
  const cssVariables = generateCSSVariables(colorPalette, typographySystem);
  
  // Generate SCSS mixins
  const scssMixins = generateSCSSMixins(componentStyles);
  
  // Generate Angular component templates
  const angularComponents = generateAngularComponentTemplates(componentStyles);
  
  // Format the style guide as markdown
  return formatStyleGuideMarkdown(
    colorPalette,
    typographySystem,
    componentStyles,
    cssVariables,
    scssMixins,
    angularComponents
  );
}

function generateColorPalette(colors) {
  // Simple implementation - in a real app, would use color theory to generate a proper palette
  const uniqueColors = [...new Set(colors)];
  
  // Create a basic palette structure
  const palette = {
    primary: uniqueColors[0] || '#007bff',
    secondary: uniqueColors[1] || '#6c757d',
    accent: uniqueColors[2] || '#28a745',
    warning: uniqueColors[3] || '#ffc107',
    danger: uniqueColors[4] || '#dc3545',
    light: uniqueColors[5] || '#f8f9fa',
    dark: uniqueColors[6] || '#343a40',
    // Add more colors from the analyzed sites
    additional: uniqueColors.slice(7, 15)
  };
  
  return palette;
}

function selectRepresentativeStyles(items) {
  // Simple implementation - select unique styles based on visual properties
  const uniqueStyles = [];
  const seenStyles = new Set();
  
  items.forEach(item => {
    const key = JSON.stringify(item);
    if (!seenStyles.has(key)) {
      seenStyles.add(key);
      uniqueStyles.push(item);
    }
  });
  
  return uniqueStyles.slice(0, 3); // Return top 3 unique styles
}

function generateCSSVariables(colorPalette, typographySystem) {
  let variables = `:root {\n`;
  
  // Color variables
  variables += `  /* Colors */\n`;
  variables += `  --color-primary: ${colorPalette.primary};\n`;
  variables += `  --color-secondary: ${colorPalette.secondary};\n`;
  variables += `  --color-accent: ${colorPalette.accent};\n`;
  variables += `  --color-warning: ${colorPalette.warning};\n`;
  variables += `  --color-danger: ${colorPalette.danger};\n`;
  variables += `  --color-light: ${colorPalette.light};\n`;
  variables += `  --color-dark: ${colorPalette.dark};\n`;
  
  // Typography variables
  variables += `\n  /* Typography */\n`;
  variables += `  --font-primary: ${typographySystem.fontFamilies[0] || 'system-ui, sans-serif'};\n`;
  if (typographySystem.fontFamilies[1]) {
    variables += `  --font-secondary: ${typographySystem.fontFamilies[1]};\n`;
  }
  
  // Font sizes
  variables += `\n  /* Font Sizes */\n`;
  const fontSizes = typographySystem.fontSizes.slice(0, 6);
  fontSizes.forEach((size, index) => {
    variables += `  --font-size-${index + 1}: ${size};\n`;
  });
  
  // Spacing
  variables += `\n  /* Spacing */\n`;
  variables += `  --spacing-xs: 0.25rem;\n`;
  variables += `  --spacing-sm: 0.5rem;\n`;
  variables += `  --spacing-md: 1rem;\n`;
  variables += `  --spacing-lg: 1.5rem;\n`;
  variables += `  --spacing-xl: 2rem;\n`;
  
  variables += `}\n`;
  return variables;
}

function generateSCSSMixins(componentStyles) {
  let mixins = `// Button Mixins\n`;
  
  // Button mixins
  componentStyles.buttons.forEach((button, index) => {
    mixins += `@mixin button-style-${index + 1} {\n`;
    mixins += `  background-color: ${button.backgroundColor || 'var(--color-primary)'};\n`;
    mixins += `  color: ${button.color || 'white'};\n`;
    mixins += `  padding: ${button.padding || '0.5rem 1rem'};\n`;
    mixins += `  border-radius: ${button.borderRadius || '4px'};\n`;
    mixins += `  font-size: ${button.fontSize || 'var(--font-size-2)'};\n`;
    mixins += `}\n\n`;
  });
  
  // Input mixins
  mixins += `// Input Mixins\n`;
  componentStyles.inputs.forEach((input, index) => {
    mixins += `@mixin input-style-${index + 1} {\n`;
    mixins += `  background-color: ${input.backgroundColor || 'white'};\n`;
    mixins += `  border: 1px solid ${input.borderColor || 'var(--color-secondary)'};\n`;
    mixins += `  padding: ${input.padding || '0.5rem'};\n`;
    mixins += `  border-radius: ${input.borderRadius || '4px'};\n`;
    mixins += `}\n\n`;
  });
  
  // Card mixins
  mixins += `// Card Mixins\n`;
  componentStyles.cards.forEach((card, index) => {
    mixins += `@mixin card-style-${index + 1} {\n`;
    mixins += `  background-color: ${card.backgroundColor || 'white'};\n`;
    mixins += `  border-radius: ${card.borderRadius || '4px'};\n`;
    mixins += `  box-shadow: ${card.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'};\n`;
    mixins += `  padding: ${card.padding || '1rem'};\n`;
    mixins += `}\n\n`;
  });
  
  return mixins;
}

function generateAngularComponentTemplates(componentStyles) {
  const templates = {
    button: `<button class="btn" [ngClass]="type" [disabled]="disabled" (click)="onClick.emit($event)">
  <ng-content></ng-content>
</button>`,
    
    input: `<div class="form-group">
  <label *ngIf="label">{{label}}</label>
  <input 
    [type]="type" 
    [placeholder]="placeholder"
    [formControl]="control"
    [ngClass]="{'is-invalid': control.invalid && control.touched}"
  />
  <div class="invalid-feedback" *ngIf="control.invalid && control.touched">
    <span *ngIf="control.errors?.required">This field is required</span>
    <span *ngIf="control.errors?.email">Please enter a valid email</span>
    <span *ngIf="control.errors?.minlength">Input is too short</span>
  </div>
</div>`,
    
    card: `<div class="card">
  <div class="card-header" *ngIf="title">{{title}}</div>
  <div class="card-body">
    <h5 class="card-title" *ngIf="subtitle">{{subtitle}}</h5>
    <ng-content></ng-content>
  </div>
  <div class="card-footer" *ngIf="footer">
    <ng-content select="[footer]"></ng-content>
  </div>
</div>`
  };
  
  return templates;
}

function formatStyleGuideMarkdown(colorPalette, typographySystem, componentStyles, cssVariables, scssMixins, angularComponents) {
  return `# Style Guide

## Color Palette

### Primary Colors
- Primary: ${colorPalette.primary}
- Secondary: ${colorPalette.secondary}
- Accent: ${colorPalette.accent}

### System Colors
- Warning: ${colorPalette.warning}
- Danger: ${colorPalette.danger}
- Light: ${colorPalette.light}
- Dark: ${colorPalette.dark}

### Additional Colors
${colorPalette.additional.map(color => `- ${color}`).join('\n')}

## Typography

### Font Families
${typographySystem.fontFamilies.map(font => `- ${font}`).join('\n')}

### Font Sizes
${typographySystem.fontSizes.map(size => `- ${size}`).join('\n')}

### Font Weights
${typographySystem.fontWeights.map(weight => `- ${weight}`).join('\n')}

## Components

### Buttons
${componentStyles.buttons.map((button, i) => 
  `#### Button Style ${i + 1}\n` +
  `- Background: ${button.backgroundColor}\n` +
  `- Color: ${button.color}\n` +
  `- Padding: ${button.padding}\n` +
  `- Border Radius: ${button.borderRadius}\n` +
  `- Font Size: ${button.fontSize}`
).join('\n\n')}

### Inputs
${componentStyles.inputs.map((input, i) => 
  `#### Input Style ${i + 1}\n` +
  `- Background: ${input.backgroundColor}\n` +
  `- Border: ${input.borderColor}\n` +
  `- Padding: ${input.padding}\n` +
  `- Border Radius: ${input.borderRadius}`
).join('\n\n')}

### Cards
${componentStyles.cards.map((card, i) => 
  `#### Card Style ${i + 1}\n` +
  `- Background: ${card.backgroundColor}\n` +
  `- Border Radius: ${card.borderRadius}\n` +
  `- Box Shadow: ${card.boxShadow}\n` +
  `- Padding: ${card.padding}`
).join('\n\n')}

## CSS Variables

\`\`\`css
${cssVariables}
\`\`\`

## SCSS Mixins

\`\`\`scss
${scssMixins}
\`\`\`

## Angular Component Templates

### Button Component

\`\`\`html
${angularComponents.button}
\`\`\`

### Input Component

\`\`\`html
${angularComponents.input}
\`\`\`

### Card Component

\`\`\`html
${angularComponents.card}
\`\`\`

## Implementation Guide

1. Copy the CSS variables to your global styles file
2. Copy the SCSS mixins to a _mixins.scss file and import it where needed
3. Create Angular components using the provided templates
4. Customize the styles to match your brand requirements

*Generated by Website Analyzer Agent*
`;
}

module.exports = { buildStyleGuide };
