const express = require('express');
const cors = require('cors');
const path = require('path');

// Import PostgreSQL API handlers
const registerHandler = require('./api/register-postgres');
const loginHandler = require('./api/login-postgres');
const validateSessionHandler = require('./api/validate-session-postgres');
const logoutHandler = require('./api/logout-postgres');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API Routes - PostgreSQL
app.post('/api/register', registerHandler);
app.post('/api/login', loginHandler);
app.post('/api/validate-session', validateSessionHandler);
app.post('/api/logout', logoutHandler);

// Serve all static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(PORT, () => {
  console.log('🚀🚀🚀 FOODFINDER WEBSITE IS LIVE! 🚀🚀🚀');
  console.log('');
  console.log('🏠 HOME PAGE: http://localhost:' + PORT + '/');
  console.log('📝 REGISTRATION: http://localhost:' + PORT + '/registration.html');
  console.log('🔐 LOGIN: http://localhost:' + PORT + '/logino.html');
  console.log('');
  console.log('✅ PostgreSQL Database Connected!');
  console.log('✅ Professional Authentication System Active!');
  console.log('✅ Multi-Device Support Enabled!');
  console.log('✅ No PHP Code - Pure Node.js/PostgreSQL!');
  console.log('');
  console.log('🎉 Your professional website is ready!');
  console.log('');
});

module.exports = app;
