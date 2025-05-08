# Website Design Analyzer Agent

A Node.js web application that analyzes websites and generates style guides and Angular.js component specifications. It also includes a Squidex CMS integration module to push the generated design system to a headless CMS.

## Features

- Analyze single or multiple websites (3-5 URLs)
- Extract design elements:
  - Color palettes
  - Typography (font families, sizes, weights)
  - Components (buttons, forms, navigation, etc.)
  - Layout patterns
- Generate comprehensive style guides
- Create Angular.js component specifications
- Push design system to Squidex CMS
- Configurable schema mapping for CMS integration
- Basic logging system
- Authentication system (disabled by default)

## Project Structure

```
website_analyzer_agent/
├── logs/                  # Log files
├── mappings/              # CMS mapping configuration files
├── middleware/            # Express middleware
├── node_modules/          # Dependencies
├── public/                # Frontend assets
│   ├── index.html         # Main HTML file
│   ├── style.css          # CSS styles
│   ├── app.js             # Frontend JavaScript
│   └── cms.js             # CMS integration JavaScript
├── routes/                # API routes
│   ├── analyze.js         # Analysis routes
│   └── cms.js             # CMS integration routes
├── services/              # Core services
│   ├── analyzer.js        # Website analysis logic
│   ├── styleGuide.js      # Style guide generation
│   └── squidexClient.js   # Squidex CMS client
├── .env                   # Environment variables
├── sample.env             # Sample environment variables
└── server.js              # Express server setup
├── nodemon.json           # Nodemon configuration
├── package.json           # Project metadata and dependencies
└── README.md              # Project documentation
```

## CMS Integration

The Website Design Analyzer Agent includes a Squidex CMS integration module that allows you to push the generated design system to a headless CMS. This enables you to use the design system in your content management workflow.

### Configuration

To configure the Squidex CMS integration, you need to set the following environment variables:

```
SQUIDEX_URL=https://cloud.squidex.io
SQUIDEX_APP_NAME=your-app-name
SQUIDEX_CLIENT_ID=your-client-id
SQUIDEX_CLIENT_SECRET=your-client-secret
SQUIDEX_AUTH_DISABLED=false
```

You can also configure these settings through the CMS Integration tab in the web interface.

### Schema Mapping

The CMS integration uses a mapping configuration to determine how design elements are mapped to Squidex schemas. The mapping configuration is a JSON file that defines the schemas and fields to use for each design element.

A default mapping configuration is provided in the `mappings/default-mapping.json` file. You can create custom mapping configurations through the web interface or by adding new JSON files to the `mappings` directory.

Example mapping configuration:

```json
{
  "name": "Default Mapping",
  "description": "Default mapping configuration for Squidex CMS integration",
  "schemas": {
    "colorPalette": {
      "type": "colorPalette",
      "fields": {
        "primary": {
          "type": "string",
          "colorType": "primary"
        },
        "secondary": {
          "type": "string",
          "colorType": "secondary"
        }
      }
    },
    "typography": {
      "type": "typography",
      "fields": {
        "fontFamilies": {
          "type": "array",
          "path": "typography.fontFamilies"
        }
      }
    }
  }
}
```

### API Endpoints

The CMS integration module provides the following API endpoints:

- `GET /cms/health` - Check the health of the Squidex CMS connection
- `POST /cms/push` - Push design data to Squidex CMS
- `GET /cms/mappings` - Get a list of available mapping configurations
- `POST /cms/mappings` - Save a mapping configuration
- `GET /cms/mappings/:name` - Get a specific mapping configuration
- `DELETE /cms/mappings/:name` - Delete a specific mapping configuration

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `sample.env`:

```
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
JWT_SECRET=your_jwt_secret_here
AUTH_ENABLED=false
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Analysis

- `POST /api/analyze/single` - Analyze a single website
  - Request body: `{ "url": "https://example.com" }`

- `POST /api/analyze/multiple` - Analyze multiple websites (3-5 URLs)
  - Request body: `{ "urls": ["https://example1.com", "https://example2.com", "https://example3.com"] }`

- `GET /api/analyze/status` - Check analyzer status

### Authentication (when enabled)

- `POST /api/auth/login` - Authenticate user
  - Request body: `{ "username": "admin", "password": "password" }`

- `GET /api/auth/status` - Check authentication status

## Authentication

Authentication is disabled by default. To enable it:

1. Set `AUTH_ENABLED=true` in the `.env` file
2. Restart the application

Default credentials:
- Username: `admin`
- Password: `password`

## Future Integration

This application is designed to be easily integrated with Squidex CMS in the future.

## License

MIT
