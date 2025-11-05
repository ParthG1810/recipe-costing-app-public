/**
 * Utility Functions
 * 
 * Common helper functions used across the application
 */

const crypto = require('crypto');
const config = require('./config');

/**
 * Generate a random token for share links
 * 
 * @param {number} length - Length of the token
 * @returns {string} Random token
 */
function generateToken(length = config.share.tokenLength) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Calculate pagination values
 * 
 * @param {number} page - Current page number
 * @param {number} pageSize - Items per page
 * @returns {object} Pagination object with offset and limit
 */
function getPagination(page = 1, pageSize = config.pagination.defaultPageSize) {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validPageSize = Math.min(
    Math.max(1, parseInt(pageSize) || config.pagination.defaultPageSize),
    config.pagination.maxPageSize
  );
  
  return {
    page: validPage,
    pageSize: validPageSize,
    offset: (validPage - 1) * validPageSize,
    limit: validPageSize
  };
}

/**
 * Build pagination response object
 * 
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 * @param {number} total - Total number of items
 * @returns {object} Pagination response object
 */
function buildPaginationResponse(page, pageSize, total) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Format success response
 * 
 * @param {any} data - Response data
 * @param {string} message - Optional success message
 * @returns {object} Formatted response
 */
function successResponse(data, message = null) {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Format error response
 * 
 * @param {string} error - Error message
 * @returns {object} Formatted error response
 */
function errorResponse(error) {
  return {
    success: false,
    error
  };
}

/**
 * Validate required fields in request body
 * 
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object|null} Error response or null if valid
 */
function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter(field => !body[field]);
  
  if (missing.length > 0) {
    return errorResponse(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return null;
}

/**
 * Get Monday of a given week
 * 
 * @param {Date} date - Any date in the week
 * @returns {Date} Monday of that week
 */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Format date to YYYY-MM-DD
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Execute Canva MCP command
 * 
 * @param {string} toolName - Name of the Canva tool
 * @param {object} params - Tool parameters
 * @returns {Promise<object>} Parsed response from Canva
 */
async function executeCanvaMCP(toolName, params) {
  const { execSync } = require('child_process');
  
  if (!config.canva.enabled) {
    throw new Error('Canva integration is not enabled');
  }
  
  const command = `manus-mcp-cli tool call ${toolName} --server canva --input '${JSON.stringify(params)}'`;
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    
    // Parse JSON from output
    // The output format may vary, so we try to extract JSON
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { raw: output };
  } catch (error) {
    console.error('Canva MCP error:', error);
    throw new Error(`Canva operation failed: ${error.message}`);
  }
}

module.exports = {
  generateToken,
  getPagination,
  buildPaginationResponse,
  successResponse,
  errorResponse,
  validateRequiredFields,
  getMonday,
  formatDate,
  executeCanvaMCP
};
