// Enhanced displayStyleGuide function
function displayStyleGuide(styleGuide) {
  styleguideContent.innerHTML = '';
  
  // Check if we have the enhanced style guide format
  const isEnhancedStyleGuide = styleGuide.colors && styleGuide.colors.palette;
  
  // Colors section
  const colorsSection = document.createElement('div');
  colorsSection.className = 'style-guide-section';
  colorsSection.innerHTML = `<h5>Colors</h5>`;
  
  // Get the color palette
  const colorPalette = isEnhancedStyleGuide ? styleGuide.colors.palette : styleGuide.colors;
  
  // Primary colors
  const primaryColorsSection = document.createElement('div');
  primaryColorsSection.className = 'mb-3';
  primaryColorsSection.innerHTML = `<h6>Primary Colors</h6>`;
  
  const primaryPalette = document.createElement('div');
  primaryPalette.className = 'color-palette';
  
  (colorPalette.primary || []).forEach(color => {
    primaryPalette.appendChild(createColorSwatch(color));
  });
  
  primaryColorsSection.appendChild(primaryPalette);
  colorsSection.appendChild(primaryColorsSection);
  
  // Secondary colors
  const secondaryColorsSection = document.createElement('div');
  secondaryColorsSection.className = 'mb-3';
  secondaryColorsSection.innerHTML = `<h6>Secondary Colors</h6>`;
  
  const secondaryPalette = document.createElement('div');
  secondaryPalette.className = 'color-palette';
  
  (colorPalette.secondary || []).forEach(color => {
    secondaryPalette.appendChild(createColorSwatch(color));
  });
  
  secondaryColorsSection.appendChild(secondaryPalette);
  colorsSection.appendChild(secondaryColorsSection);
  
  // Accent colors
  const accentColorsSection = document.createElement('div');
  accentColorsSection.className = 'mb-3';
  accentColorsSection.innerHTML = `<h6>Accent Colors</h6>`;
  
  const accentPalette = document.createElement('div');
  accentPalette.className = 'color-palette';
  
  (colorPalette.accent || []).forEach(color => {
    accentPalette.appendChild(createColorSwatch(color));
  });
  
  accentColorsSection.appendChild(accentPalette);
  colorsSection.appendChild(accentColorsSection);
  
  // Neutral colors
  const neutralColorsSection = document.createElement('div');
  neutralColorsSection.className = 'mb-3';
  neutralColorsSection.innerHTML = `<h6>Neutral Colors</h6>`;
  
  const neutralPalette = document.createElement('div');
  neutralPalette.className = 'color-palette';
  
  (colorPalette.neutral || []).forEach(color => {
    neutralPalette.appendChild(createColorSwatch(color));
  });
  
  neutralColorsSection.appendChild(neutralPalette);
  colorsSection.appendChild(neutralColorsSection);
  
  // Color shades if available
  if (isEnhancedStyleGuide && styleGuide.colors.shades) {
    const colorShades = styleGuide.colors.shades;
    
    for (const [type, shades] of Object.entries(colorShades)) {
      if (Object.keys(shades).length > 0) {
        const shadesSection = document.createElement('div');
        shadesSection.className = 'mb-3';
        shadesSection.innerHTML = `<h6>${type.charAt(0).toUpperCase() + type.slice(1)} Shades</h6>`;
        
        const shadesTable = document.createElement('table');
        shadesTable.className = 'table table-bordered';
        shadesTable.innerHTML = `
          <thead>
            <tr>
              <th>Shade</th>
              <th>Color</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(shades).map(([shade, color]) => `
              <tr>
                <td>${shade}</td>
                <td>${color}</td>
                <td><div style="width: 50px; height: 20px; background-color: ${color}; border-radius: 4px;"></div></td>
              </tr>
            `).join('')}
          </tbody>
        `;
        
        shadesSection.appendChild(shadesTable);
        colorsSection.appendChild(shadesSection);
      }
    }
  }
  
  // Semantic colors if available
  if (isEnhancedStyleGuide && styleGuide.colors.semantic) {
    const semanticSection = document.createElement('div');
    semanticSection.className = 'mb-3';
    semanticSection.innerHTML = `<h6>Semantic Colors</h6>`;
    
    const semanticPalette = document.createElement('div');
    semanticPalette.className = 'color-palette';
    
    for (const [name, color] of Object.entries(styleGuide.colors.semantic)) {
      const swatch = createColorSwatch(color);
      const info = swatch.querySelector('.color-info');
      info.textContent = `${name}: ${color}`;
      semanticPalette.appendChild(swatch);
    }
    
    semanticSection.appendChild(semanticPalette);
    colorsSection.appendChild(semanticSection);
  }
  
  styleguideContent.appendChild(colorsSection);
  
  // Typography section
  const typographySection = document.createElement('div');
  typographySection.className = 'style-guide-section';
  typographySection.innerHTML = `<h5>Typography</h5>`;
  
  // Font families
  const fontFamiliesSection = document.createElement('div');
  fontFamiliesSection.className = 'mb-3';
  fontFamiliesSection.innerHTML = `<h6>Font Families</h6>`;
  
  const fontFamiliesList = document.createElement('ul');
  fontFamiliesList.className = 'list-group mb-3';
  
  styleGuide.typography.fontFamilies.forEach(font => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    listItem.style.fontFamily = font.value;
    listItem.textContent = font.value;
    
    fontFamiliesList.appendChild(listItem);
  });
  
  fontFamiliesSection.appendChild(fontFamiliesList);
  typographySection.appendChild(fontFamiliesSection);
  
  // Font sizes
  const fontSizesSection = document.createElement('div');
  fontSizesSection.className = 'mb-3';
  fontSizesSection.innerHTML = `<h6>Font Size Scale</h6>`;
  
  const fontSizesTable = document.createElement('table');
  fontSizesTable.className = 'table table-bordered';
  fontSizesTable.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Size</th>
        <th>Example</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(styleGuide.typography.fontSizes).map(([name, size]) => `
        <tr>
          <td>${name}</td>
          <td>${size}</td>
          <td><span style="font-size: ${size}">Aa</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  fontSizesSection.appendChild(fontSizesTable);
  typographySection.appendChild(fontSizesSection);
  
  // Font weights if available
  if (styleGuide.typography.fontWeights && styleGuide.typography.fontWeights.length > 0) {
    const fontWeightsSection = document.createElement('div');
    fontWeightsSection.className = 'mb-3';
    fontWeightsSection.innerHTML = `<h6>Font Weights</h6>`;
    
    const fontWeightsList = document.createElement('ul');
    fontWeightsList.className = 'list-group mb-3';
    
    styleGuide.typography.fontWeights.forEach(weight => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      listItem.innerHTML = `
        <span style="font-weight: ${weight.value}">${weight.value}</span>
        <span class="badge bg-primary rounded-pill">${weight.count || ''}</span>
      `;
      
      fontWeightsList.appendChild(listItem);
    });
    
    fontWeightsSection.appendChild(fontWeightsList);
    typographySection.appendChild(fontWeightsSection);
  }
  
  // Line heights if available
  if (isEnhancedStyleGuide && styleGuide.typography.lineHeights) {
    const lineHeightsSection = document.createElement('div');
    lineHeightsSection.className = 'mb-3';
    lineHeightsSection.innerHTML = `<h6>Line Heights</h6>`;
    
    const lineHeightsTable = document.createElement('table');
    lineHeightsTable.className = 'table table-bordered';
    lineHeightsTable.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(styleGuide.typography.lineHeights).map(([name, value]) => `
          <tr>
            <td>${name}</td>
            <td>${value}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    lineHeightsSection.appendChild(lineHeightsTable);
    typographySection.appendChild(lineHeightsSection);
  }
  
  // Headings if available
  if (isEnhancedStyleGuide && styleGuide.typography.headings) {
    const headingsSection = document.createElement('div');
    headingsSection.className = 'mb-3';
    headingsSection.innerHTML = `<h6>Headings</h6>`;
    
    const headingsPreview = document.createElement('div');
    headingsPreview.className = 'p-3 bg-light rounded';
    
    for (const [heading, styles] of Object.entries(styleGuide.typography.headings)) {
      const headingEl = document.createElement(heading);
      headingEl.textContent = `${heading.toUpperCase()} - ${styles.fontSize}`;
      headingEl.style.fontSize = styles.fontSize;
      headingEl.style.fontWeight = styles.fontWeight;
      headingEl.style.lineHeight = styles.lineHeight;
      headingEl.style.marginBottom = styles.marginBottom;
      
      headingsPreview.appendChild(headingEl);
    }
    
    headingsSection.appendChild(headingsPreview);
    typographySection.appendChild(headingsSection);
  }
  
  styleguideContent.appendChild(typographySection);
  
  // Layout section if available
  if (isEnhancedStyleGuide && styleGuide.layout) {
    const layoutSection = document.createElement('div');
    layoutSection.className = 'style-guide-section';
    layoutSection.innerHTML = `<h5>Layout</h5>`;
    
    // Grid system
    if (styleGuide.layout.grid) {
      const gridSection = document.createElement('div');
      gridSection.className = 'mb-3';
      gridSection.innerHTML = `
        <h6>Grid System</h6>
        <div class="card">
          <div class="card-body">
            <p><strong>Columns:</strong> ${styleGuide.layout.grid.columns}</p>
            <p><strong>Gutter:</strong> ${styleGuide.layout.grid.gutter}</p>
          </div>
        </div>
      `;
      
      layoutSection.appendChild(gridSection);
    }
    
    // Containers
    if (styleGuide.layout.containers) {
      const containersSection = document.createElement('div');
      containersSection.className = 'mb-3';
      containersSection.innerHTML = `<h6>Containers</h6>`;
      
      const containersTable = document.createElement('table');
      containersTable.className = 'table table-bordered';
      containersTable.innerHTML = `
        <thead>
          <tr>
            <th>Breakpoint</th>
            <th>Width</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(styleGuide.layout.containers).map(([breakpoint, width]) => `
            <tr>
              <td>${breakpoint}</td>
              <td>${width}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
      
      containersSection.appendChild(containersTable);
      layoutSection.appendChild(containersSection);
    }
    
    // Recommended framework
    if (styleGuide.layout.recommendedFramework) {
      const frameworkSection = document.createElement('div');
      frameworkSection.className = 'mb-3';
      frameworkSection.innerHTML = `
        <h6>Recommended CSS Framework</h6>
        <div class="alert alert-info">
          <strong>${styleGuide.layout.recommendedFramework}</strong> is recommended based on the analysis.
        </div>
      `;
      
      layoutSection.appendChild(frameworkSection);
    }
    
    styleguideContent.appendChild(layoutSection);
  }
  
  // Spacing section if available
  if (styleGuide.spacing) {
    const spacingSection = document.createElement('div');
    spacingSection.className = 'style-guide-section';
    spacingSection.innerHTML = `<h5>Spacing</h5>`;
    
    const spacingTable = document.createElement('table');
    spacingTable.className = 'table table-bordered';
    spacingTable.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
          <th>Preview</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(styleGuide.spacing).map(([name, value]) => `
          <tr>
            <td>${name}</td>
            <td>${value}</td>
            <td><div style="width: ${value}; height: 20px; background-color: #007bff; border-radius: 4px;"></div></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    spacingSection.appendChild(spacingTable);
    styleguideContent.appendChild(spacingSection);
  }
  
  // Breakpoints section if available
  if (styleGuide.breakpoints) {
    const breakpointsSection = document.createElement('div');
    breakpointsSection.className = 'style-guide-section';
    breakpointsSection.innerHTML = `<h5>Breakpoints</h5>`;
    
    const breakpointsTable = document.createElement('table');
    breakpointsTable.className = 'table table-bordered';
    breakpointsTable.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(styleGuide.breakpoints).map(([name, value]) => `
          <tr>
            <td>${name}</td>
            <td>${value}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    breakpointsSection.appendChild(breakpointsTable);
    styleguideContent.appendChild(breakpointsSection);
  }
  
  // Components section
  const componentsSection = document.createElement('div');
  componentsSection.className = 'style-guide-section';
  componentsSection.innerHTML = `<h5>Components</h5>`;
  
  // List of components
  const componentsList = document.createElement('div');
  componentsList.className = 'row';
  
  for (const [type, data] of Object.entries(styleGuide.components)) {
    if (data.count > 0) {
      const componentCard = document.createElement('div');
      componentCard.className = 'col-md-6 mb-3';
      componentCard.innerHTML = `
        <div class="card">
          <div class="card-header">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <div class="card-body">
            <p>Found ${data.count} instances</p>
            ${data.examples && data.examples.length > 0 ? `
              <p><strong>Examples:</strong></p>
              <ul class="list-group">
                ${data.examples.map(example => `
                  <li class="list-group-item">
                    <small><code>&lt;${example.tag} class="${example.classes.join(' ')}"&gt;${example.text || ''}&lt;/${example.tag}&gt;</code></small>
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `;
      
      componentsList.appendChild(componentCard);
    }
  }
  
  componentsSection.appendChild(componentsList);
  styleguideContent.appendChild(componentsSection);
  
  // CSS Variables section if available
  if (isEnhancedStyleGuide && styleGuide.cssVariables) {
    const cssVarsSection = document.createElement('div');
    cssVarsSection.className = 'style-guide-section';
    cssVarsSection.innerHTML = `
      <h5>CSS Variables</h5>
      <div class="card">
        <div class="card-body">
          <pre class="mb-0"><code>${styleGuide.cssVariables}</code></pre>
        </div>
      </div>
    `;
    
    styleguideContent.appendChild(cssVarsSection);
  }
  
  // HTML Preview section if available
  if (isEnhancedStyleGuide && styleGuide.htmlPreview) {
    const previewSection = document.createElement('div');
    previewSection.className = 'style-guide-section';
    previewSection.innerHTML = `
      <h5>HTML Preview</h5>
      <div class="card">
        <div class="card-body">
          <p>A complete HTML preview has been generated. You can export it using the Export button above.</p>
          <button class="btn btn-sm btn-outline-primary" id="preview-html-btn">View HTML Preview</button>
        </div>
      </div>
    `;
    
    // Add event listener to preview button
    previewSection.querySelector('#preview-html-btn').addEventListener('click', () => {
      const blob = new Blob([styleGuide.htmlPreview], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
    
    styleguideContent.appendChild(previewSection);
  }
  
  // Display Angular components
  displayAngularComponents(styleGuide.components);
  
  // Show results section
  resultsSection.classList.remove('d-none');
}
