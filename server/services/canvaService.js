const axios = require('axios');
const { exec, execSync } = require('child_process');
const util = require('util');
const config = require('../config');

const execPromise = util.promisify(exec);

const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

/**
 * Canva Service
 * Supports three modes: MCP (sandbox), REST API (production), and Mock (local development)
 */
class CanvaService {
  constructor() {
    // Check if MCP is available
    this.mcpAvailable = this.checkMCPAvailability();
    
    // Determine mode
    const hasAPIKeys = config.canva.apiKey && config.canva.apiSecret;
    
    if (!hasAPIKeys && this.mcpAvailable) {
      this.mode = 'MCP';
    } else if (hasAPIKeys) {
      this.mode = 'REST';
    } else {
      this.mode = 'MOCK';
    }
    
    this.accessToken = null;
    console.log(`✓ Canva Service initialized in ${this.mode} mode`);
  }

  /**
   * Check if manus-mcp-cli is available
   */
  checkMCPAvailability() {
    try {
      execSync('which manus-mcp-cli', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.mode;
  }

  /**
   * Check if using MCP
   */
  isUsingMCP() {
    return this.mode === 'MCP';
  }

  /**
   * Check if using Mock mode
   */
  isUsingMock() {
    return this.mode === 'MOCK';
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
  async generateDesign(prompt, designType = 'flyer') {
    if (this.mode === 'MCP') {
      return this.generateDesignMCP(prompt, designType);
    } else if (this.mode === 'REST') {
      return this.generateDesignREST(prompt, designType);
    } else {
      return this.generateDesignMock(prompt, designType);
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
      
      if (result.job_id && result.candidates) {
        return {
          jobId: result.job_id,
          candidates: result.candidates
        };
      }
      
      throw new Error('Invalid MCP response format');
    } catch (error) {
      throw new Error(`Failed to generate design via MCP: ${error.message}`);
    }
  }

  /**
   * Generate design using Mock (for local development)
   */
  async generateDesignMock(prompt, designType) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock template data
    const mockTemplates = [
      {
        id: 'mock-template-1',
        title: 'Modern Weekly Menu',
        thumbnail: 'https://via.placeholder.com/400x600/4A90E2/ffffff?text=Modern+Menu',
        style: 'modern'
      },
      {
        id: 'mock-template-2',
        title: 'Traditional Weekly Menu',
        thumbnail: 'https://via.placeholder.com/400x600/E27D60/ffffff?text=Traditional+Menu',
        style: 'traditional'
      },
      {
        id: 'mock-template-3',
        title: 'Colorful Weekly Menu',
        thumbnail: 'https://via.placeholder.com/400x600/85CDCA/ffffff?text=Colorful+Menu',
        style: 'colorful'
      },
      {
        id: 'mock-template-4',
        title: 'Minimalist Weekly Menu',
        thumbnail: 'https://via.placeholder.com/400x600/C38D9E/ffffff?text=Minimalist+Menu',
        style: 'minimalist'
      }
    ];

    return {
      jobId: 'mock-job-' + Date.now(),
      candidates: mockTemplates
    };
  }

  /**
   * Generate design using REST API
   */
  async generateDesignREST(prompt, designType) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API mode');
      }

      const response = await axios.post(
        `${CANVA_API_BASE}/designs/generate`,
        {
          query: prompt,
          design_type: designType.toLowerCase()
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate design via REST API: ${error.message}`);
    }
  }

  /**
   * Create design from candidate
   */
  async createDesignFromCandidate(jobId, candidateId) {
    if (this.mode === 'MCP') {
      return this.createDesignFromCandidateMCP(jobId, candidateId);
    } else if (this.mode === 'REST') {
      return this.createDesignFromCandidateREST(jobId, candidateId);
    } else {
      return this.createDesignFromCandidateMock(jobId, candidateId);
    }
  }

  /**
   * Create design from candidate using MCP
   */
  async createDesignFromCandidateMCP(jobId, candidateId) {
    try {
      const command = `manus-mcp-cli tool call create-design-from-candidate --server canva --input '${JSON.stringify({
        job_id: jobId,
        candidate_id: candidateId
      })}'`;

      const { stdout } = await execPromise(command);
      const result = JSON.parse(stdout);
      
      return {
        designId: result.id,
        title: result.title,
        url: result.urls?.view_url
      };
    } catch (error) {
      throw new Error(`Failed to create design from candidate via MCP: ${error.message}`);
    }
  }

  /**
   * Create design from candidate using Mock
   */
  async createDesignFromCandidateMock(jobId, candidateId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      designId: candidateId,
      title: 'Weekly Menu Design',
      url: `https://www.canva.com/design/${candidateId}/view`
    };
  }

  /**
   * Create design from candidate using REST API
   */
  async createDesignFromCandidateREST(jobId, candidateId) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API mode');
      }

      const response = await axios.post(
        `${CANVA_API_BASE}/designs/from-candidate`,
        {
          job_id: jobId,
          candidate_id: candidateId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create design from candidate via REST API: ${error.message}`);
    }
  }

  /**
   * Export design
   */
  async exportDesign(designId, format = 'png', quality = 'pro') {
    if (this.mode === 'MCP') {
      return this.exportDesignMCP(designId, format, quality);
    } else if (this.mode === 'REST') {
      return this.exportDesignREST(designId, format, quality);
    } else {
      return this.exportDesignMock(designId, format, quality);
    }
  }

  /**
   * Export design using MCP
   */
  async exportDesignMCP(designId, format, quality) {
    try {
      const command = `manus-mcp-cli tool call export-design --server canva --input '${JSON.stringify({
        design_id: designId,
        format: format.toLowerCase(),
        quality: quality
      })}'`;

      const { stdout } = await execPromise(command);
      const result = JSON.parse(stdout);
      
      return {
        url: result.url,
        format: format,
        quality: quality
      };
    } catch (error) {
      throw new Error(`Failed to export design via MCP: ${error.message}`);
    }
  }

  /**
   * Export design using Mock
   */
  async exportDesignMock(designId, format, quality) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a placeholder image URL
    const width = 1080;
    const height = 1920;
    const mockUrl = `https://via.placeholder.com/${width}x${height}/4A90E2/ffffff?text=Weekly+Menu+${format.toUpperCase()}`;
    
    return {
      url: mockUrl,
      format: format,
      quality: quality
    };
  }

  /**
   * Export design using REST API
   */
  async exportDesignREST(designId, format, quality) {
    try {
      if (!this.accessToken) {
        throw new Error('Access token required for REST API mode');
      }

      const response = await axios.post(
        `${CANVA_API_BASE}/designs/${designId}/export`,
        {
          format: format.toLowerCase(),
          quality: quality
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to export design via REST API: ${error.message}`);
    }
  }

  /**
   * Get design details
   */
  async getDesign(designId) {
    if (this.mode === 'MCP') {
      return this.getDesignMCP(designId);
    } else if (this.mode === 'REST') {
      return this.getDesignREST(designId);
    } else {
      return this.getDesignMock(designId);
    }
  }

  /**
   * Get design using Mock
   */
  async getDesignMock(designId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: designId,
      title: 'Weekly Menu Design',
      thumbnail: `https://via.placeholder.com/400x600/4A90E2/ffffff?text=Menu+${designId}`,
      url: `https://www.canva.com/design/${designId}/view`
    };
  }

  /**
   * Upload asset
   */
  async uploadAsset(fileUrl, fileName) {
    if (this.mode === 'MOCK') {
      return this.uploadAssetMock(fileUrl, fileName);
    }
    // MCP and REST implementations would go here
    throw new Error('Asset upload not implemented for this mode');
  }

  /**
   * Upload asset using Mock
   */
  async uploadAssetMock(fileUrl, fileName) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      assetId: 'mock-asset-' + Date.now(),
      url: fileUrl,
      name: fileName
    };
  }
}

module.exports = new CanvaService();
