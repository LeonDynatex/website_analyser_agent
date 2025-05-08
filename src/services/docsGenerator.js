const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Generate comprehensive documentation based on the style guide
 * @param {Object} styleGuide - The style guide object
 * @returns {Object} - Documentation content and metadata
 */
function generateDocs(styleGuide) {
  logger.info('Generating documentation from style guide');
  
  // Generate documentation content
  const docsContent = {
    markdown: generateMarkdownDocs(styleGuide),
    timestamp: new Date().toISOString(),
    filename: `style-guide-docs-${Date.now()}.md`
  };
  
  // Save documentation to file
  const filePath = saveDocsToFile(docsContent);
  docsContent.filePath = filePath;
  
  return docsContent;
}

/**
 * Generate markdown documentation
 * @param {Object} styleGuide - The style guide object
 * @returns {String} - Markdown documentation
 */
function generateMarkdownDocs(styleGuide) {
  // Start with the title and introduction
  let markdown = `# Design System Documentation\n\n`;
  markdown += `*Generated on ${new Date().toLocaleString()}*\n\n`;
  
  markdown += `## Table of Contents\n\n`;
  markdown += `1. [Overview](#overview)\n`;
  markdown += `2. [Design Elements](#design-elements)\n`;
  markdown += `   - [Colors](#colors)\n`;
  markdown += `   - [Typography](#typography)\n`;
  markdown += `   - [Components](#components)\n`;
  markdown += `   - [Layout](#layout)\n`;
  markdown += `   - [Spacing](#spacing)\n`;
  markdown += `3. [Implementation in Angular.js](#implementation-in-angularjs)\n`;
  markdown += `   - [Project Setup](#project-setup)\n`;
  markdown += `   - [Styling Architecture](#styling-architecture)\n`;
  markdown += `   - [Component Implementation](#component-implementation)\n`;
  markdown += `4. [Structuring Content for Squidex CMS](#structuring-content-for-squidex-cms)\n`;
  markdown += `   - [Content Models](#content-models)\n`;
  markdown += `   - [Schema Design](#schema-design)\n`;
  markdown += `   - [Asset Management](#asset-management)\n`;
  markdown += `   - [Content References](#content-references)\n`;
  markdown += `5. [Importing into Squidex CMS](#importing-into-squidex-cms)\n`;
  markdown += `   - [Export/Import Process](#exportimport-process)\n`;
  markdown += `   - [CLI Commands](#cli-commands)\n`;
  markdown += `   - [API Integration](#api-integration)\n`;
  markdown += `6. [Maintaining and Extending](#maintaining-and-extending)\n`;
  markdown += `   - [Best Practices](#best-practices)\n`;
  markdown += `   - [Version Control](#version-control)\n`;
  markdown += `   - [Documentation](#documentation)\n\n`;
  
  // Overview section
  markdown += `## Overview\n\n`;
  markdown += `This documentation provides comprehensive guidance on implementing the extracted design system. It covers how to use the design elements, implement them in Angular.js, structure content for Squidex CMS, and maintain the design system over time.\n\n`;
  
  // Design Elements section
  markdown += `## Design Elements\n\n`;
  
  // Colors subsection
  markdown += `### Colors\n\n`;
  markdown += `The color palette consists of primary, secondary, accent, and neutral colors extracted from the analyzed website(s).\n\n`;
  
  // Primary colors
  markdown += `#### Primary Colors\n\n`;
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.primary) {
    markdown += `The primary colors form the main brand identity:\n\n`;
    styleGuide.colors.palette.primary.forEach((color, index) => {
      markdown += `- Primary ${index + 1}: \`${color}\`\n`;
    });
  } else if (styleGuide.colors && styleGuide.colors.primary) {
    markdown += `The primary colors form the main brand identity:\n\n`;
    styleGuide.colors.primary.forEach((color, index) => {
      markdown += `- Primary ${index + 1}: \`${color}\`\n`;
    });
  }
  markdown += `\n`;
  
  // Secondary colors
  markdown += `#### Secondary Colors\n\n`;
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.secondary) {
    markdown += `Secondary colors complement the primary palette:\n\n`;
    styleGuide.colors.palette.secondary.forEach((color, index) => {
      markdown += `- Secondary ${index + 1}: \`${color}\`\n`;
    });
  } else if (styleGuide.colors && styleGuide.colors.secondary) {
    markdown += `Secondary colors complement the primary palette:\n\n`;
    styleGuide.colors.secondary.forEach((color, index) => {
      markdown += `- Secondary ${index + 1}: \`${color}\`\n`;
    });
  }
  markdown += `\n`;
  
  // Accent colors
  markdown += `#### Accent Colors\n\n`;
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.accent) {
    markdown += `Accent colors are used for highlighting and calls to action:\n\n`;
    styleGuide.colors.palette.accent.forEach((color, index) => {
      markdown += `- Accent ${index + 1}: \`${color}\`\n`;
    });
  } else if (styleGuide.colors && styleGuide.colors.accent) {
    markdown += `Accent colors are used for highlighting and calls to action:\n\n`;
    styleGuide.colors.accent.forEach((color, index) => {
      markdown += `- Accent ${index + 1}: \`${color}\`\n`;
    });
  }
  markdown += `\n`;
  
  // Color usage guidelines
  markdown += `#### Color Usage Guidelines\n\n`;
  markdown += `- Use primary colors for main UI elements and branding\n`;
  markdown += `- Use secondary colors for supporting elements and backgrounds\n`;
  markdown += `- Use accent colors sparingly for calls to action and highlighting important information\n`;
  markdown += `- Ensure sufficient contrast between text and background colors for accessibility\n\n`;
  
  // SCSS Variables
  markdown += `#### SCSS Variables\n\n`;
  markdown += `Add these color variables to your SCSS files:\n\n`;
  markdown += "```scss\n";
  
  // Primary colors
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.primary) {
    styleGuide.colors.palette.primary.forEach((color, index) => {
      markdown += `$primary-${index + 1}: ${color};\n`;
    });
    markdown += `$primary: ${styleGuide.colors.palette.primary[0]};\n`;
  } else if (styleGuide.colors && styleGuide.colors.primary) {
    styleGuide.colors.primary.forEach((color, index) => {
      markdown += `$primary-${index + 1}: ${color};\n`;
    });
    markdown += `$primary: ${styleGuide.colors.primary[0]};\n`;
  }
  
  // Secondary colors
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.secondary) {
    styleGuide.colors.palette.secondary.forEach((color, index) => {
      markdown += `$secondary-${index + 1}: ${color};\n`;
    });
    markdown += `$secondary: ${styleGuide.colors.palette.secondary[0]};\n`;
  } else if (styleGuide.colors && styleGuide.colors.secondary) {
    styleGuide.colors.secondary.forEach((color, index) => {
      markdown += `$secondary-${index + 1}: ${color};\n`;
    });
    markdown += `$secondary: ${styleGuide.colors.secondary[0]};\n`;
  }
  
  // Accent colors
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.accent) {
    styleGuide.colors.palette.accent.forEach((color, index) => {
      markdown += `$accent-${index + 1}: ${color};\n`;
    });
    markdown += `$accent: ${styleGuide.colors.palette.accent[0]};\n`;
  } else if (styleGuide.colors && styleGuide.colors.accent) {
    styleGuide.colors.accent.forEach((color, index) => {
      markdown += `$accent-${index + 1}: ${color};\n`;
    });
    markdown += `$accent: ${styleGuide.colors.accent[0]};\n`;
  }
  
  // Semantic colors if available
  if (styleGuide.colors && styleGuide.colors.semantic) {
    Object.entries(styleGuide.colors.semantic).forEach(([name, color]) => {
      markdown += `$${name}: ${color};\n`;
    });
  }
  
  markdown += "```\n\n";
  
  // Typography subsection
  markdown += `### Typography\n\n`;
  markdown += `Typography plays a crucial role in establishing hierarchy and readability.\n\n`;
  
  // Font families
  markdown += `#### Font Families\n\n`;
  if (styleGuide.typography && styleGuide.typography.fontFamilies) {
    markdown += `The following font families are used throughout the design:\n\n`;
    styleGuide.typography.fontFamilies.forEach((font, index) => {
      markdown += `- ${index === 0 ? 'Primary' : 'Secondary'} Font: \`${font.value}\`\n`;
    });
  }
  markdown += `\n`;
  
  // Font sizes
  markdown += `#### Font Size Scale\n\n`;
  if (styleGuide.typography && styleGuide.typography.fontSizes) {
    markdown += `The font size scale provides consistency across the application:\n\n`;
    markdown += "```scss\n";
    Object.entries(styleGuide.typography.fontSizes).forEach(([name, size]) => {
      markdown += `$font-size-${name}: ${size};\n`;
    });
    markdown += "```\n\n";
  }
  
  // Headings
  markdown += `#### Headings\n\n`;
  if (styleGuide.typography && styleGuide.typography.headings) {
    markdown += `Heading styles establish visual hierarchy:\n\n`;
    markdown += "```scss\n";
    Object.entries(styleGuide.typography.headings).forEach(([heading, styles]) => {
      markdown += `${heading} {\n`;
      Object.entries(styles).forEach(([property, value]) => {
        markdown += `  ${property}: ${value};\n`;
      });
      markdown += `}\n\n`;
    });
    markdown += "```\n\n";
  }
  
  // Typography usage guidelines
  markdown += `#### Typography Usage Guidelines\n\n`;
  markdown += `- Use the primary font family for body text and most UI elements\n`;
  markdown += `- Use the secondary font family for headings or to create contrast\n`;
  markdown += `- Follow the font size scale for consistent sizing\n`;
  markdown += `- Maintain appropriate line heights for readability\n`;
  markdown += `- Ensure sufficient contrast between text and background colors\n\n`;
  
  // Components subsection
  markdown += `### Components\n\n`;
  markdown += `The design system includes the following UI components:\n\n`;
  
  if (styleGuide.components) {
    Object.entries(styleGuide.components).forEach(([type, data]) => {
      if (data.count > 0) {
        markdown += `#### ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
        
        if (data.angularComponent) {
          markdown += `**Angular Component:** \`${data.angularComponent.componentName}\`\n\n`;
          markdown += `**Selector:** \`${data.angularComponent.selector}\`\n\n`;
          
          markdown += `**Inputs:**\n\n`;
          data.angularComponent.inputs.forEach(input => {
            markdown += `- \`${input.name}\`: ${input.type} - ${input.description}\n`;
          });
          markdown += `\n`;
          
          markdown += `**Outputs:**\n\n`;
          data.angularComponent.outputs.forEach(output => {
            markdown += `- \`${output.name}\`: ${output.type} - ${output.description}\n`;
          });
          markdown += `\n`;
          
          markdown += `**Example Usage:**\n\n`;
          markdown += "```html\n";
          markdown += `<${data.angularComponent.selector}\n`;
          markdown += `  [variant]="'primary'"\n`;
          markdown += `  [size]="'md'"\n`;
          markdown += `  [disabled]="false"\n`;
          markdown += `  (click)="handleClick($event)"\n`;
          markdown += `></${data.angularComponent.selector}>\n`;
          markdown += "```\n\n";
        }
      }
    });
  }
  
  // Layout subsection
  markdown += `### Layout\n\n`;
  markdown += `The layout system provides structure and consistency to the application.\n\n`;
  
  // Grid system
  if (styleGuide.layout && styleGuide.layout.grid) {
    markdown += `#### Grid System\n\n`;
    markdown += `- Columns: ${styleGuide.layout.grid.columns}\n`;
    markdown += `- Gutter: ${styleGuide.layout.grid.gutter}\n\n`;
  }
  
  // Containers
  if (styleGuide.layout && styleGuide.layout.containers) {
    markdown += `#### Containers\n\n`;
    markdown += `Container widths at different breakpoints:\n\n`;
    Object.entries(styleGuide.layout.containers).forEach(([breakpoint, width]) => {
      markdown += `- ${breakpoint}: ${width}\n`;
    });
    markdown += `\n`;
  }
  
  // Recommended framework
  if (styleGuide.layout && styleGuide.layout.recommendedFramework) {
    markdown += `#### Recommended CSS Framework\n\n`;
    markdown += `Based on the analysis, ${styleGuide.layout.recommendedFramework} is recommended as the CSS framework.\n\n`;
  }
  
  // Spacing subsection
  markdown += `### Spacing\n\n`;
  markdown += `Consistent spacing creates rhythm and hierarchy in the layout.\n\n`;
  
  if (styleGuide.spacing) {
    markdown += `#### Spacing Scale\n\n`;
    markdown += "```scss\n";
    Object.entries(styleGuide.spacing).forEach(([name, value]) => {
      markdown += `$spacing-${name}: ${value};\n`;
    });
    markdown += "```\n\n";
    
    markdown += `#### Spacing Usage Guidelines\n\n`;
    markdown += `- Use the spacing scale for margins, paddings, and gaps\n`;
    markdown += `- Maintain consistent spacing between related elements\n`;
    markdown += `- Use larger spacing to separate distinct sections\n`;
    markdown += `- Use smaller spacing for related elements\n\n`;
  }
  
  // Implementation in Angular.js section
  markdown += `## Implementation in Angular.js\n\n`;
  
  // Project Setup subsection
  markdown += `### Project Setup\n\n`;
  markdown += `Follow these steps to set up an Angular.js project with the design system:\n\n`;
  markdown += `1. **Create a new Angular project** (if you don't have one already):\n\n`;
  markdown += "```bash\n";
  markdown += `ng new my-project --style=scss\ncd my-project\n`;
  markdown += "```\n\n";
  
  markdown += `2. **Install dependencies**:\n\n`;
  markdown += "```bash\n";
  markdown += `npm install @angular/material @angular/cdk @angular/animations\n`;
  markdown += "```\n\n";
  
  markdown += `3. **Set up global styles**:\n\n`;
  markdown += `Create a styles directory structure:\n\n`;
  markdown += "```bash\n";
  markdown += `mkdir -p src/styles/{abstracts,base,components,layout,themes,vendors}\n`;
  markdown += "```\n\n";
  
  // Styling Architecture subsection
  markdown += `### Styling Architecture\n\n`;
  markdown += `Organize your styles using the following architecture:\n\n`;
  
  markdown += `#### 1. Create Variables Files\n\n`;
  markdown += `Create \`src/styles/abstracts/_variables.scss\` with the color and typography variables:\n\n`;
  markdown += "```scss\n";
  
  // Add color variables
  markdown += `// Colors\n`;
  // Primary colors
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.primary) {
    styleGuide.colors.palette.primary.forEach((color, index) => {
      markdown += `$primary-${index + 1}: ${color};\n`;
    });
    markdown += `$primary: ${styleGuide.colors.palette.primary[0]};\n`;
  } else if (styleGuide.colors && styleGuide.colors.primary) {
    styleGuide.colors.primary.forEach((color, index) => {
      markdown += `$primary-${index + 1}: ${color};\n`;
    });
    markdown += `$primary: ${styleGuide.colors.primary[0]};\n`;
  }
  
  // Secondary colors
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.secondary) {
    styleGuide.colors.palette.secondary.forEach((color, index) => {
      markdown += `$secondary-${index + 1}: ${color};\n`;
    });
    markdown += `$secondary: ${styleGuide.colors.palette.secondary[0]};\n`;
  } else if (styleGuide.colors && styleGuide.colors.secondary) {
    styleGuide.colors.secondary.forEach((color, index) => {
      markdown += `$secondary-${index + 1}: ${color};\n`;
    });
    markdown += `$secondary: ${styleGuide.colors.secondary[0]};\n`;
  }
  
  // Accent colors
  if (styleGuide.colors && styleGuide.colors.palette && styleGuide.colors.palette.accent) {
    styleGuide.colors.palette.accent.forEach((color, index) => {
      markdown += `$accent-${index + 1}: ${color};\n`;
    });
    markdown += `$accent: ${styleGuide.colors.palette.accent[0]};\n`;
  } else if (styleGuide.colors && styleGuide.colors.accent) {
    styleGuide.colors.accent.forEach((color, index) => {
      markdown += `$accent-${index + 1}: ${color};\n`;
    });
    markdown += `$accent: ${styleGuide.colors.accent[0]};\n`;
  }
  
  // Typography variables
  markdown += `\n// Typography\n`;
  if (styleGuide.typography && styleGuide.typography.fontFamilies && styleGuide.typography.fontFamilies.length > 0) {
    markdown += `$font-family-primary: ${styleGuide.typography.fontFamilies[0].value};\n`;
    if (styleGuide.typography.fontFamilies.length > 1) {
      markdown += `$font-family-secondary: ${styleGuide.typography.fontFamilies[1].value};\n`;
    }
  }
  
  // Font sizes
  if (styleGuide.typography && styleGuide.typography.fontSizes) {
    markdown += `\n// Font sizes\n`;
    Object.entries(styleGuide.typography.fontSizes).forEach(([name, size]) => {
      markdown += `$font-size-${name}: ${size};\n`;
    });
  }
  
  // Spacing variables
  if (styleGuide.spacing) {
    markdown += `\n// Spacing\n`;
    Object.entries(styleGuide.spacing).forEach(([name, value]) => {
      markdown += `$spacing-${name}: ${value};\n`;
    });
  }
  
  // Breakpoints
  if (styleGuide.breakpoints) {
    markdown += `\n// Breakpoints\n`;
    Object.entries(styleGuide.breakpoints).forEach(([name, value]) => {
      markdown += `$breakpoint-${name}: ${value};\n`;
    });
  }
  
  markdown += "```\n\n";
  
  markdown += `#### 2. Create a Theme File\n\n`;
  markdown += `Create \`src/styles/themes/_default.scss\` to define Angular Material theme:\n\n`;
  markdown += "```scss\n";
  markdown += `@use '@angular/material' as mat;\n\n`;
  
  // Define primary palette
  markdown += `// Define custom palettes\n`;
  markdown += `$primary-palette: (\n`;
  markdown += `  50: ${styleGuide.colors?.shades?.primary?.['50'] || '#e3f2fd'},\n`;
  markdown += `  100: ${styleGuide.colors?.shades?.primary?.['100'] || '#bbdefb'},\n`;
  markdown += `  200: ${styleGuide.colors?.shades?.primary?.['200'] || '#90caf9'},\n`;
  markdown += `  300: ${styleGuide.colors?.shades?.primary?.['300'] || '#64b5f6'},\n`;
  markdown += `  400: ${styleGuide.colors?.shades?.primary?.['400'] || '#42a5f5'},\n`;
  markdown += `  500: ${styleGuide.colors?.shades?.primary?.['500'] || 
    (styleGuide.colors?.palette?.primary?.[0] || 
     styleGuide.colors?.primary?.[0] || 
     '#2196f3')},\n`;
  markdown += `  600: ${styleGuide.colors?.shades?.primary?.['600'] || '#1e88e5'},\n`;
  markdown += `  700: ${styleGuide.colors?.shades?.primary?.['700'] || '#1976d2'},\n`;
  markdown += `  800: ${styleGuide.colors?.shades?.primary?.['800'] || '#1565c0'},\n`;
  markdown += `  900: ${styleGuide.colors?.shades?.primary?.['900'] || '#0d47a1'},\n`;
  markdown += `  contrast: (\n`;
  markdown += `    50: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    100: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    200: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    300: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    400: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    500: white,\n`;
  markdown += `    600: white,\n`;
  markdown += `    700: white,\n`;
  markdown += `    800: white,\n`;
  markdown += `    900: white,\n`;
  markdown += `  )\n`;
  markdown += `);\n\n`;
  
  // Define accent palette
  markdown += `$accent-palette: (\n`;
  markdown += `  50: #fce4ec,\n`;
  markdown += `  100: #f8bbd0,\n`;
  markdown += `  200: #f48fb1,\n`;
  markdown += `  300: #f06292,\n`;
  markdown += `  400: #ec407a,\n`;
  markdown += `  500: ${styleGuide.colors?.palette?.accent?.[0] || 
    styleGuide.colors?.accent?.[0] || 
    '#e91e63'},\n`;
  markdown += `  600: #d81b60,\n`;
  markdown += `  700: #c2185b,\n`;
  markdown += `  800: #ad1457,\n`;
  markdown += `  900: #880e4f,\n`;
  markdown += `  contrast: (\n`;
  markdown += `    50: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    100: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    200: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    300: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    400: rgba(0, 0, 0, 0.87),\n`;
  markdown += `    500: white,\n`;
  markdown += `    600: white,\n`;
  markdown += `    700: white,\n`;
  markdown += `    800: white,\n`;
  markdown += `    900: white,\n`;
  markdown += `  )\n`;
  markdown += `);\n\n`;
  
  // Create the theme
  markdown += `// Define the theme\n`;
  markdown += `$primary: mat.define-palette($primary-palette);\n`;
  markdown += `$accent: mat.define-palette($accent-palette);\n`;
  markdown += `$warn: mat.define-palette(mat.$red-palette);\n\n`;
  
  markdown += `$theme: mat.define-light-theme((\n`;
  markdown += `  color: (\n`;
  markdown += `    primary: $primary,\n`;
  markdown += `    accent: $accent,\n`;
  markdown += `    warn: $warn,\n`;
  markdown += `  ),\n`;
  markdown += `  typography: mat.define-typography-config(),\n`;
  markdown += `  density: 0,\n`;
  markdown += `));\n`;
  markdown += "```\n\n";
  
  markdown += `#### 3. Create Main Styles File\n\n`;
  markdown += `Update \`src/styles.scss\` to import all style files:\n\n`;
  markdown += "```scss\n";
  markdown += `// Import variables and mixins\n`;
  markdown += `@import 'styles/abstracts/variables';\n\n`;
  
  markdown += `// Import Angular Material theme\n`;
  markdown += `@use 'styles/themes/default' as theme;\n`;
  markdown += `@use '@angular/material' as mat;\n\n`;
  
  markdown += `// Include theme styles\n`;
  markdown += `@include mat.core();\n`;
  markdown += `@include mat.all-component-themes(theme.$theme);\n\n`;
  
  markdown += `// Base styles\n`;
  markdown += `body {\n`;
  markdown += `  font-family: $font-family-primary;\n`;
  markdown += `  margin: 0;\n`;
  markdown += `  color: rgba(0, 0, 0, 0.87);\n`;
  markdown += `}\n\n`;
  
  markdown += `// Heading styles\n`;
  if (styleGuide.typography && styleGuide.typography.headings) {
    Object.entries(styleGuide.typography.headings).forEach(([heading, styles]) => {
      markdown += `${heading} {\n`;
      Object.entries(styles).forEach(([property, value]) => {
        markdown += `  ${property}: ${value};\n`;
      });
      markdown += `}\n\n`;
    });
  }
  
  markdown += `// Utility classes\n`;
  markdown += `.text-primary { color: $primary !important; }\n`;
  markdown += `.text-secondary { color: $secondary !important; }\n`;
  markdown += `.text-accent { color: $accent !important; }\n`;
  markdown += `.bg-primary { background-color: $primary !important; }\n`;
  markdown += `.bg-secondary { background-color: $secondary !important; }\n`;
  markdown += `.bg-accent { background-color: $accent !important; }\n`;
  markdown += "```\n\n";
  
  // Component Implementation subsection
  markdown += `### Component Implementation\n\n`;
  markdown += `Follow these steps to implement components based on the design system:\n\n`;
  
  markdown += `#### 1. Generate Component\n\n`;
  markdown += "```bash\n";
  markdown += `ng generate component components/button\n`;
  markdown += "```\n\n";
  
  markdown += `#### 2. Implement Component Template\n\n`;
  markdown += `Example button component template (\`button.component.html\`):\n\n`;
  markdown += "```html\n";
  markdown += `<button\n`;
  markdown += `  class="custom-button"\n`;
  markdown += `  [ngClass]="{\n`;
  markdown += `    'button-primary': variant === 'primary',\n`;
  markdown += `    'button-secondary': variant === 'secondary',\n`;
  markdown += `    'button-accent': variant === 'accent',\n`;
  markdown += `    'button-sm': size === 'sm',\n`;
  markdown += `    'button-lg': size === 'lg'\n`;
  markdown += `  }"\n`;
  markdown += `  [disabled]="disabled"\n`;
  markdown += `  (click)="onClick($event)"\n`;
  markdown += `>\n`;
  markdown += `  <ng-content></ng-content>\n`;
  markdown += `</button>\n`;
  markdown += "```\n\n";
  
  markdown += `#### 3. Implement Component Class\n\n`;
  markdown += `Example button component class (\`button.component.ts\`):\n\n`;
  markdown += "```typescript\n";
  markdown += `import { Component, Input, Output, EventEmitter } from '@angular/core';\n\n`;
  
  markdown += `@Component({\n`;
  markdown += `  selector: 'app-button',\n`;
  markdown += `  templateUrl: './button.component.html',\n`;
  markdown += `  styleUrls: ['./button.component.scss']\n`;
  markdown += `})\n`;
  markdown += `export class ButtonComponent {\n`;
  markdown += `  @Input() variant: 'primary' | 'secondary' | 'accent' = 'primary';\n`;
  markdown += `  @Input() size: 'sm' | 'md' | 'lg' = 'md';\n`;
  markdown += `  @Input() disabled: boolean = false;\n`;
  markdown += `  @Output() click = new EventEmitter<any>();\n\n`;
  
  markdown += `  onClick(event: any) {\n`;
  markdown += `    if (!this.disabled) {\n`;
  markdown += `      this.click.emit(event);\n`;
  markdown += `    }\n`;
  markdown += `  }\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  markdown += `#### 4. Implement Component Styles\n\n`;
  markdown += `Example button component styles (\`button.component.scss\`):\n\n`;
  markdown += "```scss\n";
  markdown += `@import '../../../styles/abstracts/variables';\n\n`;
  
  markdown += `.custom-button {\n`;
  markdown += `  display: inline-block;\n`;
  markdown += `  font-weight: 500;\n`;
  markdown += `  text-align: center;\n`;
  markdown += `  white-space: nowrap;\n`;
  markdown += `  vertical-align: middle;\n`;
  markdown += `  user-select: none;\n`;
  markdown += `  border: 1px solid transparent;\n`;
  markdown += `  padding: 0.375rem 0.75rem;\n`;
  markdown += `  font-size: 1rem;\n`;
  markdown += `  line-height: 1.5;\n`;
  markdown += `  border-radius: 0.25rem;\n`;
  markdown += `  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;\n`;
  markdown += `  cursor: pointer;\n\n`;
  
  markdown += `  &:focus {\n`;
  markdown += `    outline: 0;\n`;
  markdown += `    box-shadow: 0 0 0 0.2rem rgba($primary, 0.25);\n`;
  markdown += `  }\n\n`;
  
  markdown += `  &:disabled {\n`;
  markdown += `    opacity: 0.65;\n`;
  markdown += `    cursor: not-allowed;\n`;
  markdown += `  }\n\n`;
  
  markdown += `  // Variants\n`;
  markdown += `  &.button-primary {\n`;
  markdown += `    color: white;\n`;
  markdown += `    background-color: $primary;\n`;
  markdown += `    border-color: $primary;\n\n`;
  
  markdown += `    &:hover:not(:disabled) {\n`;
  markdown += `      background-color: darken($primary, 7.5%);\n`;
  markdown += `      border-color: darken($primary, 10%);\n`;
  markdown += `    }\n`;
  markdown += `  }\n\n`;
  
  markdown += `  &.button-secondary {\n`;
  markdown += `    color: white;\n`;
  markdown += `    background-color: $secondary;\n`;
  markdown += `    border-color: $secondary;\n\n`;
  
  markdown += `    &:hover:not(:disabled) {\n`;
  markdown += `      background-color: darken($secondary, 7.5%);\n`;
  markdown += `      border-color: darken($secondary, 10%);\n`;
  markdown += `    }\n`;
  markdown += `  }\n\n`;
  
  markdown += `  &.button-accent {\n`;
  markdown += `    color: white;\n`;
  markdown += `    background-color: $accent;\n`;
  markdown += `    border-color: $accent;\n\n`;
  
  markdown += `    &:hover:not(:disabled) {\n`;
  markdown += `      background-color: darken($accent, 7.5%);\n`;
  markdown += `      border-color: darken($accent, 10%);\n`;
  markdown += `    }\n`;
  markdown += `  }\n\n`;
  
  markdown += `  // Sizes\n`;
  markdown += `  &.button-sm {\n`;
  markdown += `    padding: 0.25rem 0.5rem;\n`;
  markdown += `    font-size: 0.875rem;\n`;
  markdown += `    border-radius: 0.2rem;\n`;
  markdown += `  }\n\n`;
  
  markdown += `  &.button-lg {\n`;
  markdown += `    padding: 0.5rem 1rem;\n`;
  markdown += `    font-size: 1.25rem;\n`;
  markdown += `    border-radius: 0.3rem;\n`;
  markdown += `  }\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  markdown += `#### 5. Use the Component\n\n`;
  markdown += `Example usage in a template:\n\n`;
  markdown += "```html\n";
  markdown += `<app-button variant="primary" size="md" (click)="handleClick()">Primary Button</app-button>\n`;
  markdown += `<app-button variant="secondary" size="sm">Secondary Button</app-button>\n`;
  markdown += `<app-button variant="accent" size="lg" [disabled]="isDisabled">Accent Button</app-button>\n`;
  markdown += "```\n\n";
  
  // Structuring Content for Squidex CMS section
  markdown += `## Structuring Content for Squidex CMS\n\n`;
  markdown += `Squidex CMS is a headless content management system that allows you to define content models and manage content separately from the presentation layer.\n\n`;
  
  // Content Models subsection
  markdown += `### Content Models\n\n`;
  markdown += `Based on the design system, the following content models are recommended:\n\n`;
  
  markdown += `#### Page Model\n\n`;
  markdown += "```json\n";
  markdown += `{\n`;
  markdown += `  "name": "page",\n`;
  markdown += `  "fields": [\n`;
  markdown += `    {\n`;
  markdown += `      "name": "title",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "slug",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "metaDescription",\n`;
  markdown += `      "type": "string"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "sections",\n`;
  markdown += `      "type": "array",\n`;
  markdown += `      "items": {\n`;
  markdown += `        "type": "reference",\n`;
  markdown += `        "schemaIds": ["section-hero", "section-content", "section-gallery", "section-cta"]\n`;
  markdown += `      }\n`;
  markdown += `    }\n`;
  markdown += `  ]\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  markdown += `#### Section Models\n\n`;
  markdown += `Create different section models for various page sections:\n\n`;
  
  markdown += `**Hero Section Model:**\n\n`;
  markdown += "```json\n";
  markdown += `{\n`;
  markdown += `  "name": "section-hero",\n`;
  markdown += `  "fields": [\n`;
  markdown += `    {\n`;
  markdown += `      "name": "headline",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "subheadline",\n`;
  markdown += `      "type": "string"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "backgroundImage",\n`;
  markdown += `      "type": "asset",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "ctaText",\n`;
  markdown += `      "type": "string"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "ctaLink",\n`;
  markdown += `      "type": "string"\n`;
  markdown += `    }\n`;
  markdown += `  ]\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  markdown += `**Content Section Model:**\n\n`;
  markdown += "```json\n";
  markdown += `{\n`;
  markdown += `  "name": "section-content",\n`;
  markdown += `  "fields": [\n`;
  markdown += `    {\n`;
  markdown += `      "name": "title",\n`;
  markdown += `      "type": "string"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "content",\n`;
  markdown += `      "type": "rich-text",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "image",\n`;
  markdown += `      "type": "asset"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "imagePosition",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "allowedValues": ["left", "right"]\n`;
  markdown += `    }\n`;
  markdown += `  ]\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  // Schema Design subsection
  markdown += `### Schema Design\n\n`;
  markdown += `When designing schemas for Squidex CMS, follow these best practices:\n\n`;
  markdown += `1. **Use References**: Create relationships between content items using references\n`;
  markdown += `2. **Reuse Components**: Create reusable components for common UI elements\n`;
  markdown += `3. **Validation Rules**: Add validation rules to ensure content quality\n`;
  markdown += `4. **Localization**: Enable localization for multilingual content\n`;
  markdown += `5. **Default Values**: Set default values for fields when appropriate\n\n`;
  
  markdown += `Example of a reusable component schema:\n\n`;
  markdown += "```json\n";
  markdown += `{\n`;
  markdown += `  "name": "button",\n`;
  markdown += `  "fields": [\n`;
  markdown += `    {\n`;
  markdown += `      "name": "text",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "link",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "isRequired": true\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "variant",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "allowedValues": ["primary", "secondary", "accent"],\n`;
  markdown += `      "defaultValue": "primary"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "size",\n`;
  markdown += `      "type": "string",\n`;
  markdown += `      "allowedValues": ["sm", "md", "lg"],\n`;
  markdown += `      "defaultValue": "md"\n`;
  markdown += `    },\n`;
  markdown += `    {\n`;
  markdown += `      "name": "openInNewTab",\n`;
  markdown += `      "type": "boolean",\n`;
  markdown += `      "defaultValue": false\n`;
  markdown += `    }\n`;
  markdown += `  ]\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  // Asset Management subsection
  markdown += `### Asset Management\n\n`;
  markdown += `Squidex CMS provides robust asset management capabilities. Follow these guidelines for managing assets:\n\n`;
  markdown += `1. **Organize Assets**: Create folders to organize assets by type or section\n`;
  markdown += `2. **Use Metadata**: Add metadata to assets for better searchability\n`;
  markdown += `3. **Image Transformations**: Use Squidex's image transformation capabilities for responsive images\n`;
  markdown += `4. **Asset References**: Reference assets in content models instead of hardcoding URLs\n\n`;
  
  markdown += `Example of using image transformations in Angular:\n\n`;
  markdown += "```typescript\n";
  markdown += `// Get image URL with transformations\n`;
  markdown += `getImageUrl(asset: any, width: number, height: number): string {\n`;
  markdown += `  if (!asset) return '';\n`;
  markdown += `  return \`${asset.url}?width=${width}&height=${height}&mode=crop\`;\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  markdown += "```html\n";
  markdown += `<!-- Responsive image with transformations -->\n`;
  markdown += `<img \n`;
  markdown += `  [src]="getImageUrl(content.image, 800, 600)" \n`;
  markdown += `  [srcset]="getImageUrl(content.image, 400, 300) + ' 400w, ' + \n`;
  markdown += `           getImageUrl(content.image, 800, 600) + ' 800w, ' + \n`;
  markdown += `           getImageUrl(content.image, 1200, 900) + ' 1200w'"\n`;
  markdown += `  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"\n`;
  markdown += `  [alt]="content.imageAlt || ''"\n`;
  markdown += `/>\n`;
  markdown += "```\n\n";
  
  // Content References subsection
  markdown += `### Content References\n\n`;
  markdown += `Content references allow you to create relationships between content items. This is useful for creating reusable components and maintaining content consistency.\n\n`;
  
  markdown += `#### Example: Page with Referenced Sections\n\n`;
  markdown += "```typescript\n";
  markdown += `interface Page {\n`;
  markdown += `  id: string;\n`;
  markdown += `  title: string;\n`;
  markdown += `  slug: string;\n`;
  markdown += `  metaDescription: string;\n`;
  markdown += `  sections: Section[];\n`;
  markdown += `}\n\n`;
  
  markdown += `interface Section {\n`;
  markdown += `  id: string;\n`;
  markdown += `  type: string; // 'hero', 'content', 'gallery', 'cta'\n`;
  markdown += `  // Other properties based on section type\n`;
  markdown += `}\n\n`;
  
  markdown += `// Fetch page with referenced sections\n`;
  markdown += `getPage(slug: string): Observable<Page> {\n`;
  markdown += `  return this.http.get<Page>(\`${this.apiUrl}/content/pages?$filter=data/slug eq '${slug}'&$expand=sections\`);\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  markdown += `#### Rendering Referenced Content\n\n`;
  markdown += "```html\n";
  markdown += `<!-- Page template -->\n`;
  markdown += `<div *ngIf="page">\n`;
  markdown += `  <ng-container *ngFor="let section of page.sections">\n`;
  markdown += `    <!-- Render different section types -->\n`;
  markdown += `    <app-hero-section \n`;
  markdown += `      *ngIf="section.type === 'hero'" \n`;
  markdown += `      [data]="section">\n`;
  markdown += `    </app-hero-section>\n\n`;
  
  markdown += `    <app-content-section \n`;
  markdown += `      *ngIf="section.type === 'content'" \n`;
  markdown += `      [data]="section">\n`;
  markdown += `    </app-content-section>\n\n`;
  
  markdown += `    <app-gallery-section \n`;
  markdown += `      *ngIf="section.type === 'gallery'" \n`;
  markdown += `      [data]="section">\n`;
  markdown += `    </app-gallery-section>\n\n`;
  
  markdown += `    <app-cta-section \n`;
  markdown += `      *ngIf="section.type === 'cta'" \n`;
  markdown += `      [data]="section">\n`;
  markdown += `    </app-cta-section>\n`;
  markdown += `  </ng-container>\n`;
  markdown += `</div>\n`;
  markdown += "```\n\n";
  
  // Importing into Squidex CMS section
  markdown += `## Importing into Squidex CMS\n\n`;
  markdown += `Squidex CMS provides several methods for importing content and schemas.\n\n`;
  
  // Export/Import Process subsection
  markdown += `### Export/Import Process\n\n`;
  markdown += `Follow these steps to import your design system into Squidex CMS:\n\n`;
  markdown += `1. **Create a New App**: In Squidex, create a new app for your project\n`;
  markdown += `2. **Define Schemas**: Create schemas based on your content models\n`;
  markdown += `3. **Import Assets**: Upload and organize your assets\n`;
  markdown += `4. **Import Content**: Import your content using the Squidex API or UI\n`;
  markdown += `5. **Configure Workflows**: Set up workflows for content approval if needed\n`;
  markdown += `6. **Set Up Roles and Permissions**: Configure access control\n\n`;
  
  // CLI Commands subsection
  markdown += `### CLI Commands\n\n`;
  markdown += `Squidex CLI provides commands for managing your Squidex instance. Install it using npm:\n\n`;
  markdown += "```bash\n";
  markdown += `npm install -g squidex-cli\n`;
  markdown += "```\n\n";
  
  markdown += `#### Export Schemas\n\n`;
  markdown += "```bash\n";
  markdown += `sq export schemas --app my-app --url https://cloud.squidex.io --token <your-token>\n`;
  markdown += "```\n\n";
  
  markdown += `#### Import Schemas\n\n`;
  markdown += "```bash\n";
  markdown += `sq import schemas --app my-app --url https://cloud.squidex.io --token <your-token> --file schemas.json\n`;
  markdown += "```\n\n";
  
  markdown += `#### Export Content\n\n`;
  markdown += "```bash\n";
  markdown += `sq export content --app my-app --url https://cloud.squidex.io --token <your-token> --schema page\n`;
  markdown += "```\n\n";
  
  markdown += `#### Import Content\n\n`;
  markdown += "```bash\n";
  markdown += `sq import content --app my-app --url https://cloud.squidex.io --token <your-token> --schema page --file pages.json\n`;
  markdown += "```\n\n";
  
  // API Integration subsection
  markdown += `### API Integration\n\n`;
  markdown += `Squidex provides a RESTful API for integrating with your Angular application.\n\n`;
  
  markdown += `#### Authentication\n\n`;
  markdown += "```typescript\n";
  markdown += `// squidex.service.ts\n`;
  markdown += `import { Injectable } from '@angular/core';\n`;
  markdown += `import { HttpClient, HttpHeaders } from '@angular/common/http';\n`;
  markdown += `import { Observable, of } from 'rxjs';\n`;
  markdown += `import { catchError, map, tap } from 'rxjs/operators';\n\n`;
  
  markdown += `@Injectable({\n`;
  markdown += `  providedIn: 'root'\n`;
  markdown += `})\n`;
  markdown += `export class SquidexService {\n`;
  markdown += `  private apiUrl = 'https://cloud.squidex.io/api/content/my-app';\n`;
  markdown += `  private authUrl = 'https://cloud.squidex.io/identity-server/connect/token';\n`;
  markdown += `  private clientId = 'my-app:default';\n`;
  markdown += `  private clientSecret = 'your-client-secret';\n`;
  markdown += `  private token: string;\n\n`;
  
  markdown += `  constructor(private http: HttpClient) {\n`;
  markdown += `    this.authenticate();\n`;
  markdown += `  }\n\n`;
  
  markdown += `  private authenticate() {\n`;
  markdown += `    const body = new URLSearchParams();\n`;
  markdown += `    body.set('grant_type', 'client_credentials');\n`;
  markdown += `    body.set('client_id', this.clientId);\n`;
  markdown += `    body.set('client_secret', this.clientSecret);\n`;
  markdown += `    body.set('scope', 'squidex-api');\n\n`;
  
  markdown += `    this.http.post(this.authUrl, body.toString(), {\n`;
  markdown += `      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')\n`;
  markdown += `    }).subscribe((response: any) => {\n`;
  markdown += `      this.token = response.access_token;\n`;
  markdown += `    });\n`;
  markdown += `  }\n\n`;
  
  markdown += `  private getHeaders() {\n`;
  markdown += `    return new HttpHeaders({\n`;
  markdown += `      'Authorization': \`Bearer \${this.token}\`,\n`;
  markdown += `      'Content-Type': 'application/json'\n`;
  markdown += `    });\n`;
  markdown += `  }\n\n`;
  
  markdown += `  getPages(): Observable<any[]> {\n`;
  markdown += `    return this.http.get<any>(\`\${this.apiUrl}/pages\`, { headers: this.getHeaders() })\n`;
  markdown += `      .pipe(\n`;
  markdown += `        map(response => response.items),\n`;
  markdown += `        catchError(this.handleError<any[]>('getPages', []))\n`;
  markdown += `      );\n`;
  markdown += `  }\n\n`;
  
  markdown += `  getPage(id: string): Observable<any> {\n`;
  markdown += `    return this.http.get<any>(\`\${this.apiUrl}/pages/\${id}\`, { headers: this.getHeaders() })\n`;
  markdown += `      .pipe(\n`;
  markdown += `        catchError(this.handleError<any>('getPage'))\n`;
  markdown += `      );\n`;
  markdown += `  }\n\n`;
  
  markdown += `  private handleError<T>(operation = 'operation', result?: T) {\n`;
  markdown += `    return (error: any): Observable<T> => {\n`;
  markdown += `      console.error(\`\${operation} failed: \${error.message}\`);\n`;
  markdown += `      return of(result as T);\n`;
  markdown += `    };\n`;
  markdown += `  }\n`;
  markdown += `}\n`;
  markdown += "```\n\n";
  
  // Maintaining and Extending section
  markdown += `## Maintaining and Extending\n\n`;
  markdown += `A design system is a living entity that evolves over time. Here are best practices for maintaining and extending your design system.\n\n`;
  
  // Best Practices subsection
  markdown += `### Best Practices\n\n`;
  markdown += `1. **Consistency**: Maintain consistency across all components and styles\n`;
  markdown += `2. **Documentation**: Keep documentation up-to-date as the design system evolves\n`;
  markdown += `3. **Versioning**: Use semantic versioning for your design system\n`;
  markdown += `4. **Testing**: Test components across different browsers and devices\n`;
  markdown += `5. **Accessibility**: Ensure all components meet accessibility standards\n`;
  markdown += `6. **Performance**: Optimize components for performance\n`;
  markdown += `7. **Feedback**: Collect and incorporate feedback from users\n\n`;
  
  // Version Control subsection
  markdown += `### Version Control\n\n`;
  markdown += `Use version control to track changes to your design system:\n\n`;
  markdown += `1. **Git Repository**: Store your design system in a Git repository\n`;
  markdown += `2. **Branching Strategy**: Use a branching strategy like GitFlow\n`;
  markdown += `3. **Pull Requests**: Review changes through pull requests\n`;
  markdown += `4. **Continuous Integration**: Set up CI/CD pipelines for testing and deployment\n`;
  markdown += `5. **Changelogs**: Maintain a changelog to document changes\n\n`;
  
  markdown += `Example \`CHANGELOG.md\`:\n\n`;
  markdown += "```markdown\n";
  markdown += `# Changelog\n\n`;
  markdown += `## [1.0.0] - 2025-04-30\n\n`;
  markdown += `### Added\n`;
  markdown += `- Initial release of the design system\n`;
  markdown += `- Color palette with primary, secondary, and accent colors\n`;
  markdown += `- Typography system with font families and sizes\n`;
  markdown += `- Basic components: buttons, forms, cards\n`;
  markdown += `- Layout system with grid and spacing\n\n`;
  
  markdown += `## [1.1.0] - 2025-05-15\n\n`;
  markdown += `### Added\n`;
  markdown += `- New components: tabs, modals, tooltips\n`;
  markdown += `- Dark theme support\n\n`;
  
  markdown += `### Changed\n`;
  markdown += `- Improved button component with new variants\n`;
  markdown += `- Updated typography scale for better readability\n\n`;
  
  markdown += `### Fixed\n`;
  markdown += `- Fixed contrast issues in form components\n`;
  markdown += `- Resolved spacing inconsistencies in card component\n`;
  markdown += "```\n\n";
  
  // Documentation subsection
  markdown += `### Documentation\n\n`;
  markdown += `Maintain comprehensive documentation for your design system:\n\n`;
  markdown += `1. **Component Library**: Document each component with examples and usage guidelines\n`;
  markdown += `2. **Style Guide**: Document colors, typography, spacing, and other design tokens\n`;
  markdown += `3. **Design Principles**: Document the principles that guide your design decisions\n`;
  markdown += `4. **Contribution Guidelines**: Document how to contribute to the design system\n`;
  markdown += `5. **Release Process**: Document the process for releasing new versions\n\n`;
  
  markdown += `Consider using tools like Storybook to create a living documentation of your components:\n\n`;
  markdown += "```bash\n";
  markdown += `# Install Storybook\n`;
  markdown += `npx storybook init\n\n`;
  
  markdown += `# Run Storybook\n`;
  markdown += `npm run storybook\n`;
  markdown += "```\n\n";
  
  markdown += `Example component story:\n\n`;
  markdown += "```typescript\n";
  markdown += `// button.stories.ts\n`;
  markdown += `import { Meta, Story } from '@storybook/angular';\n`;
  markdown += `import { ButtonComponent } from './button.component';\n\n`;
  
  markdown += `export default {\n`;
  markdown += `  title: 'Components/Button',\n`;
  markdown += `  component: ButtonComponent,\n`;
  markdown += `  argTypes: {\n`;
  markdown += `    variant: {\n`;
  markdown += `      control: { type: 'select', options: ['primary', 'secondary', 'accent'] },\n`;
  markdown += `      defaultValue: 'primary'\n`;
  markdown += `    },\n`;
  markdown += `    size: {\n`;
  markdown += `      control: { type: 'select', options: ['sm', 'md', 'lg'] },\n`;
  markdown += `      defaultValue: 'md'\n`;
  markdown += `    },\n`;
  markdown += `    disabled: {\n`;
  markdown += `      control: 'boolean',\n`;
  markdown += `      defaultValue: false\n`;
  markdown += `    }\n`;
  markdown += `  }\n`;
  markdown += `} as Meta;\n\n`;
  
  markdown += `const Template: Story<ButtonComponent> = (args: ButtonComponent) => ({\n`;
  markdown += `  props: args,\n`;
  markdown += `  template: '<app-button [variant]="variant" [size]="size" [disabled]="disabled">Button Text</app-button>'\n`;
  markdown += `});\n\n`;
  
  markdown += `export const Primary = Template.bind({});\n`;
  markdown += `Primary.args = {\n`;
  markdown += `  variant: 'primary',\n`;
  markdown += `  size: 'md',\n`;
  markdown += `  disabled: false\n`;
  markdown += `};\n\n`;
  
  markdown += `export const Secondary = Template.bind({});\n`;
  markdown += `Secondary.args = {\n`;
  markdown += `  variant: 'secondary',\n`;
  markdown += `  size: 'md',\n`;
  markdown += `  disabled: false\n`;
  markdown += `};\n\n`;
  
  markdown += `export const Accent = Template.bind({});\n`;
  markdown += `Accent.args = {\n`;
  markdown += `  variant: 'accent',\n`;
  markdown += `  size: 'md',\n`;
  markdown += `  disabled: false\n`;
  markdown += `};\n\n`;
  
  markdown += `export const Small = Template.bind({});\n`;
  markdown += `Small.args = {\n`;
  markdown += `  variant: 'primary',\n`;
  markdown += `  size: 'sm',\n`;
  markdown += `  disabled: false\n`;
  markdown += `};\n\n`;
  
  markdown += `export const Large = Template.bind({});\n`;
  markdown += `Large.args = {\n`;
  markdown += `  variant: 'primary',\n`;
  markdown += `  size: 'lg',\n`;
  markdown += `  disabled: false\n`;
  markdown += `};\n\n`;
  
  markdown += `export const Disabled = Template.bind({});\n`;
  markdown += `Disabled.args = {\n`;
  markdown += `  variant: 'primary',\n`;
  markdown += `  size: 'md',\n`;
  markdown += `  disabled: true\n`;
  markdown += `};\n`;
  markdown += "```\n\n";
  
  // Conclusion
  markdown += `## Conclusion\n\n`;
  markdown += `This documentation provides a comprehensive guide for implementing the extracted design system in Angular.js and integrating it with Squidex CMS. By following these guidelines, you can create a consistent, maintainable, and extensible design system that will serve as the foundation for your web applications.\n\n`;
  markdown += `Remember that a design system is a living entity that evolves over time. Regularly review and update your design system based on user feedback and changing requirements to ensure it continues to meet the needs of your organization and users.\n`;
  
  return markdown;
}

/**
 * Save documentation to a file
 * @param {Object} docsContent - Documentation content and metadata
 * @returns {String} - File path
 */
function saveDocsToFile(docsContent) {
  const tempDir = '/tmp';
  const filePath = path.join(tempDir, docsContent.filename);
  
  try {
    fs.writeFileSync(filePath, docsContent.markdown);
    logger.info(`Documentation saved to ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`Error saving documentation to file: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateDocs,
  saveDocsToFile
};
