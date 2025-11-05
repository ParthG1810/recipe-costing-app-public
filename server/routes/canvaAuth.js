const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');
const { successResponse, errorResponse } = require('../utils');

// Canva OAuth configuration
const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
const CANVA_SCOPES = [
  'design:content:read',
  'design:content:write',
  'design:meta:read',
  'asset:read',
  'asset:write',
  'folder:read',
  'folder:write'
].join(' ');

/**
 * @route   GET /api/canva/auth/connect
 * @desc    Initiate Canva OAuth flow
 * @access  Public
 */
router.get('/connect', (req, res) => {
  try {
    if (!config.canva.apiKey) {
      return res.status(500).json(errorResponse('Canva API credentials not configured'));
    }

    const state = Buffer.from(JSON.stringify({
      timestamp: Date.now(),
      userId: req.query.userId || 'guest'
    })).toString('base64');

    const authUrl = `${CANVA_AUTH_URL}?` + new URLSearchParams({
      client_id: config.canva.apiKey,
      redirect_uri: config.canva.redirectUri,
      response_type: 'code',
      scope: CANVA_SCOPES,
      state: state
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('Canva OAuth initiation error:', error);
    res.status(500).json(errorResponse('Failed to initiate Canva authentication'));
  }
});

/**
 * @route   GET /api/canva/auth/callback
 * @desc    Handle Canva OAuth callback
 * @access  Public
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${config.frontendUrl}/weekly-menu/templates?error=${error}`);
    }

    if (!code) {
      return res.status(400).json(errorResponse('Authorization code not provided'));
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(CANVA_TOKEN_URL, {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.canva.redirectUri,
      client_id: config.canva.apiKey,
      client_secret: config.canva.apiSecret
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // In production, store these tokens in database associated with user
    // For now, we'll store in session or return to frontend
    const tokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    };

    // TODO: Store tokens in database
    // await db.query('UPDATE users SET canva_access_token = ?, canva_refresh_token = ?, canva_token_expires_at = ? WHERE id = ?',
    //   [access_token, refresh_token, new Date(tokens.expiresAt), userId]);

    // Redirect to frontend with success
    res.redirect(`${config.frontendUrl}/weekly-menu/templates?connected=true`);
  } catch (error) {
    console.error('Canva OAuth callback error:', error.response?.data || error.message);
    res.redirect(`${config.frontendUrl}/weekly-menu/templates?error=auth_failed`);
  }
});

/**
 * @route   POST /api/canva/auth/refresh
 * @desc    Refresh Canva access token
 * @access  Private
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(errorResponse('Refresh token required'));
    }

    const tokenResponse = await axios.post(CANVA_TOKEN_URL, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.canva.apiKey,
      client_secret: config.canva.apiSecret
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    res.json(successResponse({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    }, 'Token refreshed successfully'));
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json(errorResponse('Failed to refresh token'));
  }
});

/**
 * @route   GET /api/canva/auth/status
 * @desc    Check Canva connection status
 * @access  Public
 */
router.get('/status', (req, res) => {
  const canvaService = require('../services/canvaService');
  const mode = canvaService.getMode();
  
  const messages = {
    'MCP': 'Using Canva MCP integration (sandbox mode)',
    'REST': 'Using Canva REST API (production mode)',
    'MOCK': 'Using Mock Canva service (local development mode)'
  };

  res.json(successResponse({
    mode: mode,
    message: messages[mode],
    note: mode === 'MOCK' ? 'Mock mode provides sample templates for testing. Add Canva API keys for real integration.' : null
  }));
});

module.exports = router;
