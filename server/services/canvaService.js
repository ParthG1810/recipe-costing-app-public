const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const config = require('../config');

const execPromise = util.promisify(exec);

const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

/**
 * Canva Service
 * Supports both MCP (development) and REST API (production) modes
 */
class CanvaService {
  constructor() {
    this.useMCP = !config.canva.apiKey || !config.canva.apiSecret;
    this.accessToken = null;
  }

  /**
   * Check if using MCP or REST API
   */
  isUsingMCP() {
    return this.useMCP;
  }

  /**
   * Set access token for REST API calls
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Generate AI design templates
   */
  async generateDesign(prompt, designType = 'Flyer') {
    if (this.useMCP) {
      return this.generateDesignMCP(prompt, designType);
    } else {
      return this.generateDesignREST(prompt, designType);
    }
  }

  /**
   * Generate design using MCP
   */
  async generateDesignMCP(prompt, designType) {
    try {
    const command = `manus-mcp-cli tool call generate-design --server canva --input '${JSON.stringify({
      query: prompt,
      design_type: designType.toLowerCase()
    })}'`;

      const { stdout } = await execPromise(command);
      const result = JSON.parse(stdout);
      
      return {
        candidates: result.candidates || [],
        jobId: result.job_id
      };
    } catch (error) {
      console.error('MCP generate-design error:', error);
      throw new Error(`Failed to generate design via MCP: ${error.message}`);
    }
  }

  /**
   * Generate design using REST API
   */
  async generateDesignREST(prompt, designType) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API');
      }

      const response = await axios.post(`${CANVA_API_BASE}/designs/generate`, {
        query: prompt,
        design_type: designType
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('REST API generate-design error:', error.response?.data || error.message);
      throw new Error(`Failed to generate design via REST API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create design from candidate
   */
  async createDesignFromCandidate(candidateId, jobId) {
    if (this.useMCP) {
      return this.createDesignFromCandidateMCP(candidateId, jobId);
    } else {
      return this.createDesignFromCandidateREST(candidateId, jobId);
    }
  }

  /**
   * Create design from candidate using MCP
   */
  async createDesignFromCandidateMCP(candidateId, jobId) {
    try {
      const command = `manus-mcp-cli tool call create-design-from-candidate --server canva --input '${JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId
      })}'`;

      const { stdout } = await execPromise(command);
      const result = JSON.parse(stdout);
      
      return {
        designId: result.design_id,
        title: result.title,
        url: result.url
      };
    } catch (error) {
      console.error('MCP create-design-from-candidate error:', error);
      throw new Error(`Failed to create design from candidate via MCP: ${error.message}`);
    }
  }

  /**
   * Create design from candidate using REST API
   */
  async createDesignFromCandidateREST(candidateId, jobId) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API');
      }

      const response = await axios.post(`${CANVA_API_BASE}/designs/from-candidate`, {
        candidate_id: candidateId,
        job_id: jobId
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('REST API create-design-from-candidate error:', error.response?.data || error.message);
      throw new Error(`Failed to create design from candidate via REST API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get design details
   */
  async getDesign(designId) {
    if (this.useMCP) {
      return this.getDesignMCP(designId);
    } else {
      return this.getDesignREST(designId);
    }
  }

  /**
   * Get design using MCP
   */
  async getDesignMCP(designId) {
    try {
      const command = `manus-mcp-cli tool call get-design --server canva --input '${JSON.stringify({
        design_id: designId
      })}'`;

      const { stdout } = await execPromise(command);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('MCP get-design error:', error);
      throw new Error(`Failed to get design via MCP: ${error.message}`);
    }
  }

  /**
   * Get design using REST API
   */
  async getDesignREST(designId) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API');
      }

      const response = await axios.get(`${CANVA_API_BASE}/designs/${designId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('REST API get-design error:', error.response?.data || error.message);
      throw new Error(`Failed to get design via REST API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Export design
   */
  async exportDesign(designId, format = 'png', quality = 'high') {
    if (this.useMCP) {
      return this.exportDesignMCP(designId, format, quality);
    } else {
      return this.exportDesignREST(designId, format, quality);
    }
  }

  /**
   * Export design using MCP
   */
  async exportDesignMCP(designId, format, quality) {
    try {
      const command = `manus-mcp-cli tool call export-design --server canva --input '${JSON.stringify({
        design_id: designId,
        format: format,
        quality: quality
      })}'`;

      const { stdout } = await execPromise(command);
      const result = JSON.parse(stdout);
      
      return {
        exportUrl: result.export_url,
        format: format,
        quality: quality
      };
    } catch (error) {
      console.error('MCP export-design error:', error);
      throw new Error(`Failed to export design via MCP: ${error.message}`);
    }
  }

  /**
   * Export design using REST API
   */
  async exportDesignREST(designId, format, quality) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API');
      }

      const response = await axios.post(`${CANVA_API_BASE}/designs/${designId}/export`, {
        format: format,
        quality: quality
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('REST API export-design error:', error.response?.data || error.message);
      throw new Error(`Failed to export design via REST API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get export formats
   */
  async getExportFormats(designId) {
    if (this.useMCP) {
      return this.getExportFormatsMCP(designId);
    } else {
      return this.getExportFormatsREST(designId);
    }
  }

  /**
   * Get export formats using MCP
   */
  async getExportFormatsMCP(designId) {
    try {
      const command = `manus-mcp-cli tool call get-export-formats --server canva --input '${JSON.stringify({
        design_id: designId
      })}'`;

      const { stdout } = await execPromise(command);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('MCP get-export-formats error:', error);
      throw new Error(`Failed to get export formats via MCP: ${error.message}`);
    }
  }

  /**
   * Get export formats using REST API
   */
  async getExportFormatsREST(designId) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API');
      }

      const response = await axios.get(`${CANVA_API_BASE}/designs/${designId}/export-formats`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('REST API get-export-formats error:', error.response?.data || error.message);
      throw new Error(`Failed to get export formats via REST API: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Upload asset to Canva
   */
  async uploadAsset(fileUrl, fileName) {
    if (this.useMCP) {
      return this.uploadAssetMCP(fileUrl, fileName);
    } else {
      return this.uploadAssetREST(fileUrl, fileName);
    }
  }

  /**
   * Upload asset using MCP
   */
  async uploadAssetMCP(fileUrl, fileName) {
    try {
      const command = `manus-mcp-cli tool call upload-asset --server canva --input '${JSON.stringify({
        file_url: fileUrl,
        file_name: fileName
      })}'`;

      const { stdout } = await execPromise(command);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('MCP upload-asset error:', error);
      throw new Error(`Failed to upload asset via MCP: ${error.message}`);
    }
  }

  /**
   * Upload asset using REST API
   */
  async uploadAssetREST(fileUrl, fileName) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API');
      }

      const response = await axios.post(`${CANVA_API_BASE}/assets/upload`, {
        file_url: fileUrl,
        file_name: fileName
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('REST API upload-asset error:', error.response?.data || error.message);
      throw new Error(`Failed to upload asset via REST API: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new CanvaService();
