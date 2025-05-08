/**
 * CMS Integration Module
 * Handles the UI for integrating with Squidex CMS
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cmsForm = document.getElementById('cms-form');
  const cmsUrlInput = document.getElementById('cms-url');
  const cmsAppNameInput = document.getElementById('cms-app-name');
  const cmsClientIdInput = document.getElementById('cms-client-id');
  const cmsClientSecretInput = document.getElementById('cms-client-secret');
  const cmsAuthDisabledCheckbox = document.getElementById('cms-auth-disabled');
  const cmsCredentialsSection = document.getElementById('cms-credentials-section');
  const mappingSelect = document.getElementById('mapping-select');
  const mappingEditor = document.getElementById('mapping-editor');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const testConnectionBtn = document.getElementById('test-connection-btn');
  const pushToCmsBtn = document.getElementById('push-to-cms-btn');
  const connectionStatus = document.getElementById('connection-status');
  const pushResults = document.getElementById('push-results');
  const loadingIndicator = document.getElementById('cms-loading');
  
  // Initialize the CMS tab
  initCmsTab();
  
  /**
   * Initialize the CMS tab
   */
  async function initCmsTab() {
    // Load saved configuration from localStorage
    loadSavedConfig();
    
    // Load available mappings
    await loadMappings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check connection status
    await checkConnectionStatus();
  }
  
  /**
   * Load saved configuration from localStorage
   */
  function loadSavedConfig() {
    const savedConfig = JSON.parse(localStorage.getItem('cmsConfig') || '{}');
    
    if (savedConfig.url) cmsUrlInput.value = savedConfig.url;
    if (savedConfig.appName) cmsAppNameInput.value = savedConfig.appName;
    if (savedConfig.clientId) cmsClientIdInput.value = savedConfig.clientId;
    if (savedConfig.clientSecret) cmsClientSecretInput.value = savedConfig.clientSecret;
    if (savedConfig.authDisabled !== undefined) {
      cmsAuthDisabledCheckbox.checked = savedConfig.authDisabled;
      toggleCredentialsSection();
    }
  }
  
  /**
   * Load available mappings from the server
   */
  async function loadMappings() {
    try {
      showLoading(true);
      
      const response = await fetch('/cms/mappings');
      if (!response.ok) {
        throw new Error(`Failed to load mappings: ${response.statusText}`);
      }
      
      const mappings = await response.json();
      
      // Clear existing options
      mappingSelect.innerHTML = '';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a mapping...';
      mappingSelect.appendChild(defaultOption);
      
      // Add mapping options
      mappings.forEach(mapping => {
        const option = document.createElement('option');
        option.value = mapping.name;
        option.textContent = mapping.name;
        mappingSelect.appendChild(option);
      });
      
      // If there's a saved mapping selection, load it
      const savedConfig = JSON.parse(localStorage.getItem('cmsConfig') || '{}');
      if (savedConfig.selectedMapping) {
        mappingSelect.value = savedConfig.selectedMapping;
        await loadMappingConfig(savedConfig.selectedMapping);
      } else if (mappings.length > 0) {
        // Load the first mapping by default
        mappingSelect.value = mappings[0].name;
        await loadMappingConfig(mappings[0].name);
      }
    } catch (error) {
      console.error('Error loading mappings:', error);
      showError('Failed to load mappings: ' + error.message);
    } finally {
      showLoading(false);
    }
  }
  
  /**
   * Load a specific mapping configuration
   * @param {string} mappingName The name of the mapping to load
   */
  async function loadMappingConfig(mappingName) {
    if (!mappingName) {
      mappingEditor.value = '';
      return;
    }
    
    try {
      showLoading(true);
      
      const response = await fetch(`/cms/mappings/${mappingName}`);
      if (!response.ok) {
        throw new Error(`Failed to load mapping: ${response.statusText}`);
      }
      
      const mapping = await response.json();
      mappingEditor.value = JSON.stringify(mapping, null, 2);
    } catch (error) {
      console.error(`Error loading mapping ${mappingName}:`, error);
      showError(`Failed to load mapping ${mappingName}: ${error.message}`);
    } finally {
      showLoading(false);
    }
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Toggle credentials section when auth disabled checkbox changes
    cmsAuthDisabledCheckbox.addEventListener('change', toggleCredentialsSection);
    
    // Save configuration when form is submitted
    cmsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveConfiguration();
    });
    
    // Load mapping when selection changes
    mappingSelect.addEventListener('change', async (e) => {
      await loadMappingConfig(e.target.value);
      
      // Save the selection to localStorage
      const savedConfig = JSON.parse(localStorage.getItem('cmsConfig') || '{}');
      savedConfig.selectedMapping = e.target.value;
      localStorage.setItem('cmsConfig', JSON.stringify(savedConfig));
    });
    
    // Save mapping button
    saveConfigBtn.addEventListener('click', async () => {
      await saveMappingConfig();
    });
    
    // Test connection button
    testConnectionBtn.addEventListener('click', async () => {
      await testConnection();
    });
    
    // Push to CMS button
    pushToCmsBtn.addEventListener('click', async () => {
      await pushToCms();
    });
  }
  
  /**
   * Toggle the credentials section based on the auth disabled checkbox
   */
  function toggleCredentialsSection() {
    if (cmsAuthDisabledCheckbox.checked) {
      cmsCredentialsSection.classList.add('d-none');
    } else {
      cmsCredentialsSection.classList.remove('d-none');
    }
  }
  
  /**
   * Save the CMS configuration
   */
  async function saveConfiguration() {
    try {
      // Get form values
      const config = {
        url: cmsUrlInput.value.trim(),
        appName: cmsAppNameInput.value.trim(),
        clientId: cmsClientIdInput.value.trim(),
        clientSecret: cmsClientSecretInput.value.trim(),
        authDisabled: cmsAuthDisabledCheckbox.checked,
        selectedMapping: mappingSelect.value
      };
      
      // Save to localStorage
      localStorage.setItem('cmsConfig', JSON.stringify(config));
      
      // Update environment variables on the server
      await updateServerConfig(config);
      
      showSuccess('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      showError('Failed to save configuration: ' + error.message);
    }
  }
  
  /**
   * Update the server configuration with the new values
   * @param {Object} config The configuration to update
   */
  async function updateServerConfig(config) {
    // This would typically update environment variables on the server
    // For now, we'll just log it
    console.log('Server config would be updated with:', config);
    
    // In a real implementation, you might call an API endpoint to update the server config
    // or restart the server with the new environment variables
  }
  
  /**
   * Save the current mapping configuration
   */
  async function saveMappingConfig() {
    try {
      showLoading(true);
      
      // Get the mapping configuration from the editor
      let mappingConfig;
      try {
        mappingConfig = JSON.parse(mappingEditor.value);
      } catch (error) {
        throw new Error('Invalid JSON in mapping editor: ' + error.message);
      }
      
      // Get the mapping name
      let mappingName = mappingSelect.value;
      if (!mappingName) {
        // If no mapping is selected, use the name from the config or prompt for a name
        mappingName = mappingConfig.name || prompt('Enter a name for this mapping:');
        if (!mappingName) {
          throw new Error('Mapping name is required');
        }
      }
      
      // Save the mapping
      const response = await fetch('/cms/mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: mappingName,
          config: mappingConfig
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
      
      // Reload mappings
      await loadMappings();
      
      showSuccess('Mapping saved successfully');
    } catch (error) {
      console.error('Error saving mapping:', error);
      showError('Failed to save mapping: ' + error.message);
    } finally {
      showLoading(false);
    }
  }
  
  /**
   * Test the connection to the Squidex CMS
   */
  async function testConnection() {
    try {
      showLoading(true);
      
      // Save the configuration first
      await saveConfiguration();
      
      // Test the connection
      const response = await fetch('/cms/health');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
      
      const health = await response.json();
      
      // Update the connection status
      connectionStatus.innerHTML = `
        <div class="alert ${health.connected ? 'alert-success' : 'alert-warning'}">
          <strong>Status:</strong> ${health.connected ? 'Connected' : 'Not Connected'}<br>
          <strong>URL:</strong> ${health.url || 'Not configured'}<br>
          <strong>App Name:</strong> ${health.appName || 'Not configured'}<br>
          <strong>Auth Disabled:</strong> ${health.authDisabled ? 'Yes' : 'No'}
        </div>
      `;
      
      if (health.connected) {
        showSuccess('Connection successful');
      } else {
        showWarning('Not connected to Squidex CMS');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      showError('Connection test failed: ' + error.message);
      
      // Update the connection status
      connectionStatus.innerHTML = `
        <div class="alert alert-danger">
          <strong>Status:</strong> Error<br>
          <strong>Error:</strong> ${error.message}
        </div>
      `;
    } finally {
      showLoading(false);
    }
  }
  
  /**
   * Push the design to the Squidex CMS
   */
  async function pushToCms() {
    try {
      showLoading(true);
      
      // Get the mapping configuration from the editor
      let mappingConfig;
      try {
        mappingConfig = JSON.parse(mappingEditor.value);
      } catch (error) {
        throw new Error('Invalid JSON in mapping editor: ' + error.message);
      }
      
      // Push to CMS
      const response = await fetch('/cms/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mappingConfig
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
      
      const result = await response.json();
      
      // Display the results
      pushResults.innerHTML = `
        <div class="alert ${result.success ? 'alert-success' : 'alert-warning'}">
          <h5>Push Results</h5>
          <p><strong>Status:</strong> ${result.success ? 'Success' : 'Partial Success'}</p>
          <p><strong>Created:</strong> ${result.created.length} items</p>
          <p><strong>Updated:</strong> ${result.updated.length} items</p>
          <p><strong>Failed:</strong> ${result.failed.length} items</p>
          
          ${result.errors.length > 0 ? `
            <h6>Errors:</h6>
            <ul>
              ${result.errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
      
      if (result.success) {
        showSuccess('Successfully pushed design to Squidex CMS');
      } else {
        showWarning('Partially pushed design to Squidex CMS with some errors');
      }
    } catch (error) {
      console.error('Error pushing to CMS:', error);
      showError('Failed to push to CMS: ' + error.message);
      
      // Display the error
      pushResults.innerHTML = `
        <div class="alert alert-danger">
          <h5>Push Failed</h5>
          <p><strong>Error:</strong> ${error.message}</p>
        </div>
      `;
    } finally {
      showLoading(false);
    }
  }
  
  /**
   * Check the connection status to the Squidex CMS
   */
  async function checkConnectionStatus() {
    try {
      const response = await fetch('/cms/health');
      if (!response.ok) {
        return;
      }
      
      const health = await response.json();
      
      // Update the connection status
      connectionStatus.innerHTML = `
        <div class="alert ${health.connected ? 'alert-success' : 'alert-warning'}">
          <strong>Status:</strong> ${health.connected ? 'Connected' : 'Not Connected'}<br>
          <strong>URL:</strong> ${health.url || 'Not configured'}<br>
          <strong>App Name:</strong> ${health.appName || 'Not configured'}<br>
          <strong>Auth Disabled:</strong> ${health.authDisabled ? 'Yes' : 'No'}
        </div>
      `;
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  }
  
  /**
   * Show a success message
   * @param {string} message The message to show
   */
  function showSuccess(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success alert-dismissible fade show';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertsContainer = document.getElementById('cms-alerts');
    alertsContainer.appendChild(alertElement);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertElement.classList.remove('show');
      setTimeout(() => alertElement.remove(), 150);
    }, 5000);
  }
  
  /**
   * Show a warning message
   * @param {string} message The message to show
   */
  function showWarning(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-warning alert-dismissible fade show';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertsContainer = document.getElementById('cms-alerts');
    alertsContainer.appendChild(alertElement);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertElement.classList.remove('show');
      setTimeout(() => alertElement.remove(), 150);
    }, 5000);
  }
  
  /**
   * Show an error message
   * @param {string} message The message to show
   */
  function showError(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-danger alert-dismissible fade show';
    alertElement.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertsContainer = document.getElementById('cms-alerts');
    alertsContainer.appendChild(alertElement);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      alertElement.classList.remove('show');
      setTimeout(() => alertElement.remove(), 150);
    }, 8000);
  }
  
  /**
   * Show or hide the loading indicator
   * @param {boolean} show Whether to show the loading indicator
   */
  function showLoading(show) {
    if (show) {
      loadingIndicator.classList.remove('d-none');
    } else {
      loadingIndicator.classList.add('d-none');
    }
  }
});
