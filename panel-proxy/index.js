const express = require('express');
const axios = require('axios');
const https = require('https');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const PANEL_URL = process.env.PANEL_URL || 'https://localhost:2053';
const PANEL_PATH = process.env.PANEL_PATH || '/25FyvMy2qxELmnl5Sp';
const API_KEY = process.env.API_KEY || 'your-secret-key-here';

// Allow insecure HTTPS (self-signed cert)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

app.use(cors());
app.use(express.json());

// Middleware: Check API Key
const checkApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ success: false, msg: 'Unauthorized' });
  }
  next();
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '3X-UI Panel Proxy',
    panel: PANEL_URL + PANEL_PATH
  });
});

// Proxy: Login
app.post('/login', checkApiKey, async (req, res) => {
  try {
    console.log('[Proxy] Login request');
    
    const response = await axios.post(
      `${PANEL_URL}${PANEL_PATH}/login`,
      {
        username: req.body.username,
        password: req.body.password,
        twoFactorCode: req.body.twoFactorCode || ''
      },
      {
        httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: () => true
      }
    );

    // Forward cookies back to client
    if (response.headers['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }

    console.log('[Proxy] Login response:', response.data);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Proxy] Login error:', error.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Proxy error: ' + error.message 
    });
  }
});

// Proxy: Get Inbound Details
app.get('/inbound/:id', checkApiKey, async (req, res) => {
  try {
    const cookies = req.headers.cookie || '';
    
    const response = await axios.get(
      `${PANEL_URL}${PANEL_PATH}/panel/api/inbounds/get/${req.params.id}`,
      {
        httpsAgent,
        headers: {
          'Cookie': cookies,
          'Accept': 'application/json'
        },
        validateStatus: () => true
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Proxy] Get inbound error:', error.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Proxy error: ' + error.message 
    });
  }
});

// Proxy: Add Client
app.post('/addClient', checkApiKey, async (req, res) => {
  try {
    const cookies = req.headers.cookie || '';
    
    const response = await axios.post(
      `${PANEL_URL}${PANEL_PATH}/panel/api/inbounds/addClient`,
      req.body,
      {
        httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
          'Accept': 'application/json'
        },
        validateStatus: () => true
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Proxy] Add client error:', error.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Proxy error: ' + error.message 
    });
  }
});

// Proxy: Update Client
app.post('/updateClient/:id', checkApiKey, async (req, res) => {
  try {
    const cookies = req.headers.cookie || '';
    
    const response = await axios.post(
      `${PANEL_URL}${PANEL_PATH}/panel/api/inbounds/updateClient/${req.params.id}`,
      req.body,
      {
        httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
          'Accept': 'application/json'
        },
        validateStatus: () => true
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Proxy] Update client error:', error.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Proxy error: ' + error.message 
    });
  }
});

// Proxy: Delete Client
app.post('/delClient', checkApiKey, async (req, res) => {
  try {
    const cookies = req.headers.cookie || '';
    
    const response = await axios.post(
      `${PANEL_URL}${PANEL_PATH}/panel/api/inbounds/delClient`,
      req.body,
      {
        httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
          'Accept': 'application/json'
        },
        validateStatus: () => true
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Proxy] Delete client error:', error.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Proxy error: ' + error.message 
    });
  }
});

// Proxy: Get All Inbounds (for checking)
app.get('/inbounds', checkApiKey, async (req, res) => {
  try {
    const cookies = req.headers.cookie || '';
    
    const response = await axios.get(
      `${PANEL_URL}${PANEL_PATH}/panel/api/inbounds/list`,
      {
        httpsAgent,
        headers: {
          'Cookie': cookies,
          'Accept': 'application/json'
        },
        validateStatus: () => true
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Proxy] Get inbounds error:', error.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Proxy error: ' + error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 3X-UI Panel Proxy running on port ${PORT}`);
  console.log(`📡 Forwarding to: ${PANEL_URL}${PANEL_PATH}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
});
