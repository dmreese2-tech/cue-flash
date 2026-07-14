// Cue Flash Server
// Serves the control panel (desktop) and display client (iPad/iPhone, iOS 9+),
// pushes messages over WebSocket, and exposes a plain HTTP API for
// Bitfocus Companion (or anything else that can fire a GET/POST request).

var express = require('express');
var path = require('path');
var http = require('http');
var WebSocket = require('ws');

var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Shared-secret token, required on write endpoints once this is exposed to
// the public internet. Set it as an environment variable on your host
// (e.g. Render's dashboard). Locally, it defaults to unset = no auth
// required, so nothing changes for LAN-only use.
var CUEFLASH_TOKEN = process.env.CUEFLASH_TOKEN || '';

function checkToken(req, res, next) {
  if (!CUEFLASH_TOKEN) return next(); // no token configured -> auth disabled
  var supplied = req.query.token || (req.body && req.body.token) || req.get('x-cueflash-token');
  if (supplied !== CUEFLASH_TOKEN) {
    return res.status(401).json({ ok: false, error: 'invalid or missing token' });
  }
  next();
}

var VALID_MODES = ['dark', 'light', 'urgent'];

var lastState = {
  active: false,
  message: '',
  mode: 'dark',
  flash: false,
  ts: Date.now()
};

function broadcast(state) {
  lastState = state;
  var payload = JSON.stringify(state);
  wss.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function buildState(message, mode, flash) {
  return {
    active: true,
    message: String(message).slice(0, 80),
    mode: VALID_MODES.indexOf(mode) !== -1 ? mode : 'dark',
    flash: !!flash,
    ts: Date.now()
  };
}

// ---- HTTP API (this is what Bitfocus Companion should hit) ----

// GET /api/flash?message=WRAP+UP&mode=urgent&flash=1&token=...
app.get('/api/flash', checkToken, function (req, res) {
  var message = req.query.message;
  if (!message) return res.status(400).json({ ok: false, error: 'message is required' });
  var flash = req.query.flash === '1' || req.query.flash === 'true';
  broadcast(buildState(message, req.query.mode, flash));
  res.json({ ok: true, state: lastState });
});

// POST /api/flash  { "message": "WRAP UP", "mode": "urgent", "flash": true, "token": "..." }
app.post('/api/flash', checkToken, function (req, res) {
  var body = req.body || {};
  if (!body.message) return res.status(400).json({ ok: false, error: 'message is required' });
  broadcast(buildState(body.message, body.mode, body.flash));
  res.json({ ok: true, state: lastState });
});

// GET or POST /api/clear?token=...
app.all('/api/clear', checkToken, function (req, res) {
  broadcast({ active: false, message: '', mode: 'dark', flash: false, ts: Date.now() });
  res.json({ ok: true });
});

// Polling fallback for the display client (also handy for debugging).
// CORS-open since this is a harmless read used by the GitHub Pages status
// page to check whether the demo Codespace is currently awake.
app.get('/api/state', function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.json(lastState);
});

// ---- WebSocket ----
wss.on('connection', function (ws) {
  // Send current state immediately so a freshly-opened display catches up
  ws.send(JSON.stringify(lastState));
});

// ---- Convenience redirects ----
app.get('/', function (req, res) {
  res.redirect('/control.html');
});

var PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log('Cue Flash server listening on port ' + PORT);
  console.log('Control panel:  http://<this-machine-ip>:' + PORT + '/control.html');
  console.log('Display client: http://<this-machine-ip>:' + PORT + '/display.html');
  console.log('Companion API:  http://<this-machine-ip>:' + PORT + '/api/flash?message=WRAP+UP&mode=urgent&flash=1');
});
