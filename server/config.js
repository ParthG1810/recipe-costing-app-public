/**
 * Configuration Module
 * 
 * Centralizes all environment variables and configuration settings.
 * Uses dotenv to load variables from .env file.
 */

require('dotenv').config();

const config = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Mysql',
    database: process.env.DB_NAME || 'recipe_costing_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // File Upload Configuration
  upload: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',')
  },

  // Canva Integration
  canva: {
    enabled: process.env.CANVA_ENABLED === 'true',
  },

  // Image Processing
  image: {
    quality: parseInt(process.env.IMAGE_QUALITY) || 85,
    maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH) || 1080,
    maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT) || 1080
  },

  // Menu Export Configuration
  menuExport: {
    format: process.env.MENU_EXPORT_FORMAT || 'png',
    quality: process.env.MENU_EXPORT_QUALITY || 'pro',
    width: parseInt(process.env.MENU_EXPORT_WIDTH) || 1080
  },

  // Share Links Configuration
  share: {
    baseUrl: process.env.SHARE_BASE_URL || 'http://localhost:3000/menu',
    tokenLength: parseInt(process.env.SHARE_TOKEN_LENGTH) || 32
  },

  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validate required configuration
function validateConfig() {
  const required = [
    'database.host',
    'database.user',
    'database.password',
    'database.database'
  ];

  const missing = [];

  required.forEach(key => {
    const keys = key.split('.');
    let value = config;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined || value === null || value === '') {
        missing.push(key);
        break;
      }
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required configuration:');
    missing.forEach(key => console.error(`   - ${key}`));
    throw new Error('Invalid configuration. Please check your .env file.');
  }
}

// Validate on load
validateConfig();

module.exports = config;
