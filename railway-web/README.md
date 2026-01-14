# Token Deploy Web App - Railway Deployment

This is a web version of the Token Deploy GUI, ready to deploy on Railway.

## Project Structure

```
railway-web/
├── server.js          # Express + WebSocket server
├── package.json       # Dependencies
├── railway.json       # Railway deployment config
├── README.md          # This file
└── public/            # Frontend files
    ├── index.html     # Main HTML
    ├── styles.css     # Styling
    ├── renderer.js    # Frontend JavaScript
    └── images/        # Logo images
```

## How to Deploy to Railway

### Method 1: Railway Dashboard (Easiest)

1. **Go to [Railway](https://railway.app/)** and sign in (or create account)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" OR "Empty Project"

3. **If using GitHub:**
   - Push this `railway-web` folder to a GitHub repository
   - Connect Railway to your GitHub repo
   - Railway will auto-deploy

4. **If using Empty Project + CLI:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Link to your project
   railway link
   
   # Deploy
   railway up
   ```

### Method 2: Railway CLI Direct Deploy

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Create new project:**
   ```bash
   railway init
   ```

4. **Deploy:**
   ```bash
   cd railway-web
   railway up
   ```

5. **Get your URL:**
   ```bash
   railway open
   ```

## Environment Variables (Optional)

Set these in Railway dashboard under "Variables":

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 (Railway auto-sets) |
| `DEEPL_API_KEY` | DeepL translation API key | Built-in key |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/create` | POST | Create token transaction |
| `/api/submit` | POST | Submit signed transaction |
| `/api/translate` | POST | Translate text (DeepL) |
| `/api/tweet` | GET | Fetch tweet data |
| `/api/fetch-image` | GET | Proxy image fetch |
| `/api/set-fields` | POST/GET | Set GUI fields |

## WebSocket Events

Connect to the WebSocket at `wss://your-railway-url/`

**Incoming Events:**
- `connected` - Connection established
- `token_create_success` - Token created successfully
- `token_create_error` - Token creation failed
- `set-gui-fields` - Update GUI fields

**Outgoing Events:**
- `deploy` - Deploy a new token
- `pre_upload` - Pre-upload image
- `pre_build` - Pre-build transaction

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Open browser to http://localhost:3000
```

## Before Deploying

1. Copy your frontend files to the `public/` folder:
   - `index.html`
   - `styles.css`
   - `renderer.js` (web-compatible version)
   - `images/` folder with logos

2. Make sure `renderer.js` is modified to:
   - Remove `require('electron')` and `ipcRenderer`
   - Use `fetch()` for API calls
   - Use browser `WebSocket` for connections
   - Use `localStorage` instead of file system

## Token API Integration

This server proxies requests to the backend Token API at:
`https://token-api.up.railway.app`

Endpoints:
- `POST /create` - Build unsigned transactions
- `POST /submit` - Submit signed transactions

## Troubleshooting

**Build fails:**
- Check `package.json` has correct dependencies
- Ensure Node.js version >= 18

**WebSocket not connecting:**
- Railway URLs use HTTPS, so use `wss://` not `ws://`
- Check browser console for errors

**CORS errors:**
- The server has CORS enabled for all origins
- If still having issues, check the API you're calling
