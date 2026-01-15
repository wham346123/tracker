const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Port configuration (Railway provides PORT env variable)
const PORT = process.env.PORT || 3000;

// Token API endpoint
const TOKEN_API_URL = 'https://token-api.up.railway.app';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// API ENDPOINTS
// =====================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy to Token API - Create transaction
app.post('/api/create', async (req, res) => {
  try {
    const response = await fetch(`${TOKEN_API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy to Token API - Submit signed transaction
app.post('/api/submit', async (req, res) => {
  try {
    const response = await fetch(`${TOKEN_API_URL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DeepL Translation API proxy
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY || 'b7cbb44f-4d26-4d4b-8334-55aea3d66a6d';
    
    const response = await fetch('https://api.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`
      },
      body: new URLSearchParams({
        text: text,
        source_lang: sourceLang || 'EN',
        target_lang: targetLang || 'ZH',
        model_type: 'prefer_quality_optimized'
      })
    });
    
    const data = await response.json();
    if (data.translations && data.translations[0]) {
      res.json({ success: true, translatedText: data.translations[0].text });
    } else {
      res.json({ success: false, error: 'Translation failed' });
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Fetch tweet data (proxy to VPS server)
app.get('/api/tweet', async (req, res) => {
  try {
    const tweetUrl = req.query.url;
    if (!tweetUrl) {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }
    
    // Proxy to VPS server (HTTP is fine for server-to-server)
    const vpsUrl = `http://149.28.53.76:47291/tweet?url=${encodeURIComponent(tweetUrl)}`;
    console.log('Fetching tweet from VPS:', vpsUrl);
    
    const response = await fetch(vpsUrl);
    if (!response.ok) {
      throw new Error(`VPS returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('VPS response:', data);
    
    // Forward the response
    res.json(data);
  } catch (error) {
    console.error('Tweet fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch image (proxy for CORS)
app.get('/api/fetch-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    res.set('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set GUI fields (for external API calls)
app.post('/api/set-fields', (req, res) => {
  const data = req.body;
  
  // Broadcast to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'set-gui-fields', data }));
    }
  });
  
  res.json({ success: true, message: 'Fields updated', received: data });
});

app.get('/api/set-fields', (req, res) => {
  const { name, ticker, twitter, website } = req.query;
  const data = {};
  if (name) data.name = name;
  if (ticker) data.ticker = ticker;
  if (twitter) data.twitter = twitter;
  if (website) data.website = website;
  
  // Broadcast to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'set-gui-fields', data }));
    }
  });
  
  res.json({ success: true, message: 'Fields updated', received: data });
});

// =====================================================
// WEBSOCKET HANDLING
// =====================================================

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total: ${clients.size}`);
  
  // Send welcome message
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Token Deploy Server' }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data.type);
      
      // Handle different message types
      switch (data.type) {
        case 'deploy':
          // Proxy deploy request to token API
          await handleDeploy(ws, data);
          break;
          
        case 'pre_upload':
          // Handle image pre-upload
          ws.send(JSON.stringify({ 
            type: 'pre_upload_success', 
            uri: data.image_data,
            cached: true 
          }));
          break;
          
        case 'pre_build':
          // Acknowledge pre-build (actual building happens on deploy)
          ws.send(JSON.stringify({ 
            type: 'pre_build_success',
            txId: `prebuild_${Date.now()}`,
            mint: 'pending'
          }));
          break;
          
        case 'blast_now':
          // Handle instant deploy
          ws.send(JSON.stringify({ type: 'status', message: 'Deploy initiated' }));
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Handle deploy request
// Supported platforms: pump, bonk, usd1
// NOTE: usd1 uses USD1 tokens for amount (NOT SOL)
async function handleDeploy(ws, data) {
  try {
    // Get platform - support both 'type' and 'platform' keys
    const platform = data.platform || data.type || 'pump';
    
    // Validate platform
    const validPlatforms = ['pump', 'bonk', 'usd1'];
    if (!validPlatforms.includes(platform)) {
      ws.send(JSON.stringify({
        type: 'token_create_error',
        message: `Invalid platform: ${platform}. Supported: pump, bonk, usd1`
      }));
      return;
    }
    
    // Build request for token API
    const createRequest = {
      platform: platform,
      name: data.name || 'My Token',
      symbol: data.ticker || data.symbol || 'TOKEN',
      image: data.image_data || data.image || '',
      prio: data.prio || 0.001, // MEV protection tip (max 0.5 SOL)
      amount: data.amount || data.buy_amount || 0.01, // REQUIRED: Buy amount in SOL (or USD1 for usd1 platform)
      wallets: data.wallets || []
    };
    
    // Add optional fields
    if (data.twitter) createRequest.twitter = data.twitter;
    if (data.website) createRequest.website = data.website;
    
    // Add bundle configuration for multi-wallet buys
    if (data.bundle && data.bundle.enabled) {
      createRequest.bundle = {
        enabled: true,
        amount: data.bundle.amount || 0.1 // Total SOL to split among wallets
      };
    }
    
    ws.send(JSON.stringify({ 
      type: 'status', 
      message: `Creating ${platform.toUpperCase()} token transaction...` 
    }));
    
    console.log('Deploy request:', JSON.stringify(createRequest, null, 2));
    
    // Call token API
    const response = await fetch(`${TOKEN_API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createRequest)
    });
    
    const result = await response.json();
    console.log('Token API response:', JSON.stringify(result, null, 2));
    
    if (result.mint_pubkey || result.mint) {
      ws.send(JSON.stringify({
        type: 'token_create_success',
        message: `${platform.toUpperCase()} token created successfully!`,
        address: result.mint_pubkey || result.mint,
        transactions: result.transactions,
        platform: platform
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'token_create_error',
        message: result.error || result.message || 'Failed to create transaction',
        details: result
      }));
    }
  } catch (error) {
    console.error('Deploy error:', error);
    ws.send(JSON.stringify({
      type: 'token_create_error',
      message: error.message
    }));
  }
}

// Broadcast to all clients (for real-time updates)
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Token Deploy Web Server Running      ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   Port: ${PORT}                            ║`);
  console.log(`║   Token API: ${TOKEN_API_URL}  ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health        - Health check');
  console.log('  POST /api/create    - Create token transaction');
  console.log('  POST /api/submit    - Submit signed transaction');
  console.log('  POST /api/translate - Translate text (DeepL)');
  console.log('  GET  /api/tweet     - Fetch tweet data');
  console.log('  WS   /              - WebSocket connection');
});
