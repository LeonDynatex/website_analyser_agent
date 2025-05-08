const { SquidexClient } = require('@squidex/squidex');

/**
 * Squidex CMS Client Service
 * Handles authentication and communication with the Squidex CMS API
 */
class SquidexClientService {
  constructor() {
    this.client = null;
    this.isAuthenticated = false;
    this.authDisabled = process.env.SQUIDEX_AUTH_DISABLED === 'true';
  }

  /**
   * Initialize the Squidex client
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async initialize() {
    try {
      // If authentication is disabled, create a mock client
      if (this.authDisabled) {
        console.log('Squidex authentication is disabled. Using mock client.');
        this.client = this._createMockClient();
        this.isAuthenticated = true;
        return true;
      }
        if (process.env.SQUIDEX_AUTH_DISABLED !== 'true') {

            // Check for required environment variables
            const requiredVars = ['SQUIDEX_URL', 'SQUIDEX_CLIENT_ID', 'SQUIDEX_CLIENT_SECRET', 'SQUIDEX_APP_NAME'];
            const missingVars = requiredVars.filter(varName => !process.env[varName]);

            if (missingVars.length > 0) {
                console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
                return false;
            }
        }

      // Create and initialize the Squidex client
      this.client = new SquidexClient({
        appName: process.env.SQUIDEX_APP_NAME,
        clientId: process.env.SQUIDEX_CLIENT_ID,
        clientSecret: process.env.SQUIDEX_CLIENT_SECRET,
        url: process.env.SQUIDEX_URL
      });

      // Authenticate with Squidex
      await this.client.clientCredentialsFlow();
      this.isAuthenticated = true;
      console.log('Successfully authenticated with Squidex CMS');
      return true;
    } catch (error) {
      console.error('Failed to initialize Squidex client:', error);
      return false;
    }
  }

  /**
   * Check if the client is authenticated
   * @returns {boolean} True if authenticated
   */
  isConnected() {
    return this.isAuthenticated;
  }

  /**
   * Push design elements to Squidex CMS
   * @param {Object} designData The design data to push
   * @param {Object} mappingConfig The mapping configuration
   * @returns {Promise<Object>} Result of the push operation
   */
  async pushDesign(designData, mappingConfig) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with Squidex CMS. Call initialize() first.');
    }

    try {
      const results = {
        success: true,
        created: [],
        updated: [],
        failed: [],
        errors: []
      };

      // Process each schema in the mapping configuration
      for (const schemaName in mappingConfig.schemas) {
        const schemaConfig = mappingConfig.schemas[schemaName];
        const schemaData = this._mapDesignToSchema(designData, schemaConfig);
        
        // Skip if no data to push for this schema
        if (!schemaData || schemaData.length === 0) {
          continue;
        }

        // Process each item for the schema
        for (const item of schemaData) {
          try {
            // Check if item already exists (if ID is provided)
            let existingItem = null;
            if (item.id) {
              try {
                existingItem = await this.client.contents.getContent(
                  process.env.SQUIDEX_APP_NAME,
                  schemaName,
                  item.id
                );
              } catch (e) {
                // Item doesn't exist, will create new
              }
            }

            // Prepare data for Squidex (remove id if present)
            const contentData = { ...item };
            delete contentData.id;

            // Update or create the item
            if (existingItem) {
              const updated = await this.client.contents.updateContent(
                process.env.SQUIDEX_APP_NAME,
                schemaName,
                item.id,
                contentData
              );
              results.updated.push({
                schema: schemaName,
                id: updated.id,
                data: contentData
              });
            } else {
              const created = await this.client.contents.createContent(
                process.env.SQUIDEX_APP_NAME,
                schemaName,
                contentData
              );
              results.created.push({
                schema: schemaName,
                id: created.id,
                data: contentData
              });
            }
          } catch (error) {
            console.error(`Error pushing item to schema ${schemaName}:`, error);
            results.failed.push({
              schema: schemaName,
              data: item,
              error: error.message
            });
            results.errors.push(error.message);
          }
        }
      }

      // Set success to false if any items failed
      if (results.failed.length > 0) {
        results.success = false;
      }

      return results;
    } catch (error) {
      console.error('Error pushing design to Squidex:', error);
      throw error;
    }
  }

  /**
   * Get health status of the Squidex connection
   * @returns {Promise<Object>} Health status
   */
  async getHealth() {
    return {
      connected: this.isAuthenticated,
      authDisabled: this.authDisabled,
      url: process.env.SQUIDEX_URL,
      appName: process.env.SQUIDEX_APP_NAME
    };
  }

  /**
   * Map design data to Squidex schema format
   * @param {Object} designData The design data
   * @param {Object} schemaConfig The schema configuration
   * @returns {Array} Mapped data for the schema
   * @private
   */
  _mapDesignToSchema(designData, schemaConfig) {
    const result = [];

    // Handle different types of schemas
    switch (schemaConfig.type) {
      case 'styleGuide':
        // Map style guide data
        result.push(this._mapStyleGuide(designData, schemaConfig));
        break;
      
      case 'colorPalette':
        // Map color palette data
        result.push(this._mapColorPalette(designData, schemaConfig));
        break;
      
      case 'typography':
        // Map typography data
        result.push(this._mapTypography(designData, schemaConfig));
        break;
      
      case 'components':
        // Map components data (multiple items)
        const componentItems = this._mapComponents(designData, schemaConfig);
        result.push(...componentItems);
        break;
      
      default:
        console.warn(`Unknown schema type: ${schemaConfig.type}`);
    }

    return result;
  }

  /**
   * Map style guide data to Squidex schema
   * @param {Object} designData The design data
   * @param {Object} schemaConfig The schema configuration
   * @returns {Object} Mapped style guide data
   * @private
   */
  _mapStyleGuide(designData, schemaConfig) {
    const result = {};
    
    // Map fields according to the schema configuration
    for (const field in schemaConfig.fields) {
      const fieldConfig = schemaConfig.fields[field];
      const value = this._getValueFromPath(designData, fieldConfig.path);
      
      if (value !== undefined) {
        result[field] = { iv: this._formatValue(value, fieldConfig.type) };
      }
    }
    
    return result;
  }

  /**
   * Map color palette data to Squidex schema
   * @param {Object} designData The design data
   * @param {Object} schemaConfig The schema configuration
   * @returns {Object} Mapped color palette data
   * @private
   */
  _mapColorPalette(designData, schemaConfig) {
    const result = {};
    
    // Get colors from design data
    const colorPalette = designData.styleGuide?.colorPalette || {};
    
    // Map fields according to the schema configuration
    for (const field in schemaConfig.fields) {
      const fieldConfig = schemaConfig.fields[field];
      let value;
      
      if (fieldConfig.path) {
        value = this._getValueFromPath(colorPalette, fieldConfig.path);
      } else if (fieldConfig.colorType) {
        // Handle specific color types (primary, secondary, etc.)
        value = colorPalette[fieldConfig.colorType];
      }
      
      if (value !== undefined) {
        result[field] = { iv: this._formatValue(value, fieldConfig.type) };
      }
    }
    
    return result;
  }

  /**
   * Map typography data to Squidex schema
   * @param {Object} designData The design data
   * @param {Object} schemaConfig The schema configuration
   * @returns {Object} Mapped typography data
   * @private
   */
  _mapTypography(designData, schemaConfig) {
    const result = {};
    
    // Get typography from design data
    const typography = designData.styleGuide?.typography || {};
    
    // Map fields according to the schema configuration
    for (const field in schemaConfig.fields) {
      const fieldConfig = schemaConfig.fields[field];
      let value;
      
      if (fieldConfig.path) {
        value = this._getValueFromPath(typography, fieldConfig.path);
      } else if (fieldConfig.typographyType) {
        // Handle specific typography types (fonts, sizes, etc.)
        value = typography[fieldConfig.typographyType];
      }
      
      if (value !== undefined) {
        result[field] = { iv: this._formatValue(value, fieldConfig.type) };
      }
    }
    
    return result;
  }

  /**
   * Map components data to Squidex schema
   * @param {Object} designData The design data
   * @param {Object} schemaConfig The schema configuration
   * @returns {Array} Mapped components data
   * @private
   */
  _mapComponents(designData, schemaConfig) {
    const results = [];
    
    // Get components from design data
    const components = designData.styleGuide?.components || {};
    const componentType = schemaConfig.componentType || 'buttons';
    const componentItems = components[componentType] || [];
    
    // Map each component
    for (const component of componentItems) {
      const result = {};
      
      // Map fields according to the schema configuration
      for (const field in schemaConfig.fields) {
        const fieldConfig = schemaConfig.fields[field];
        let value;
        
        if (fieldConfig.path) {
          value = this._getValueFromPath(component, fieldConfig.path);
        } else if (fieldConfig.componentProp) {
          // Handle specific component properties
          value = component[fieldConfig.componentProp];
        }
        
        if (value !== undefined) {
          result[field] = { iv: this._formatValue(value, fieldConfig.type) };
        }
      }
      
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get a value from a nested object using a dot-notation path
   * @param {Object} obj The object to extract from
   * @param {string} path The path to the value
   * @returns {*} The extracted value
   * @private
   */
  _getValueFromPath(obj, path) {
    if (!obj || !path) return undefined;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    
    return current;
  }

  /**
   * Format a value according to the Squidex field type
   * @param {*} value The value to format
   * @param {string} type The Squidex field type
   * @returns {*} The formatted value
   * @private
   */
  _formatValue(value, type) {
    switch (type) {
      case 'string':
        return String(value);
      
      case 'number':
        return Number(value);
      
      case 'boolean':
        return Boolean(value);
      
      case 'array':
        return Array.isArray(value) ? value : [value];
      
      case 'json':
        return typeof value === 'object' ? value : JSON.parse(JSON.stringify(value));
      
      default:
        return value;
    }
  }

  /**
   * Create a mock client for when authentication is disabled
   * @returns {Object} Mock client
   * @private
   */
  _createMockClient() {
    return {
      contents: {
        getContent: async () => {
          throw new Error('Item not found (mock)');
        },
        createContent: async (appName, schemaName, data) => {
          console.log(`[MOCK] Creating content in ${appName}/${schemaName}:`, data);
          return { id: `mock-id-${Date.now()}`, data };
        },
        updateContent: async (appName, schemaName, id, data) => {
          console.log(`[MOCK] Updating content in ${appName}/${schemaName}/${id}:`, data);
          return { id, data };
        }
      }
    };
  }
}

// Create and export a singleton instance
const squidexClient = new SquidexClientService();
module.exports = squidexClient;
