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

// Fetch tweet data (proxy for CORS)
app.get('/api/tweet', async (req, res) => {
  try {
    const tweetUrl = req.query.url;
    if (!tweetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}`;
    const response = await fetch(oembedUrl);
    const data = await response.json();
    
    // Extract text from HTML
    let text = '';
    if (data.html) {
      text = data.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    res.json({
      text: text,
      author_name: data.author_name,
      author_url: data.author_url,
      images: []
    });
  } catch (error) {
    console.error('Tweet fetch error:', error);
    res.status(500).json({ error: error.message });
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
async function handleDeploy(ws, data) {
  try {
    // Build request for token API
    const createRequest = {
      platform: data.type || 'pump',
      name: data.name || ' ',
      symbol: data.ticker || ' ',
      image: data.image_data || '',
      amount: data.buy_amount || 0.01,
      prio: 0.001,
      wallets: data.wallets || []
    };
    
    // Add optional fields
    if (data.twitter) createRequest.twitter = data.twitter;
    if (data.website) createRequest.website = data.website;
    
    ws.send(JSON.stringify({ type: 'status', message: 'Creating transaction...' }));
    
    // Call token API
    const response = await fetch(`${TOKEN_API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createRequest)
    });
    
    const result = await response.json();
    
    if (result.mint_pubkey) {
      ws.send(JSON.stringify({
        type: 'token_create_success',
        message: 'Transaction created successfully',
        address: result.mint_pubkey,
        transactions: result.transactions
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'token_create_error',
        message: result.error || 'Failed to create transaction'
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
