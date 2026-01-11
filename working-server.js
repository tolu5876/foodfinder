const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve from current directory

// API Routes (using mock for now)
app.post('/api/register', (req, res) => {
  res.json({ success: true, message: 'Registration endpoint working!' });
});

app.post('/api/login', (req, res) => {
  res.json({ success: true, message: 'Login endpoint working!' });
});

// Serve all static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/registration.html`);
  console.log(`🔐 Try: http://localhost:${PORT}/logino.html`);
  console.log(`🏠 Try: http://localhost:${PORT}/`);
  console.log('\n✅ All files should work now!');
});

module.exports = app;
