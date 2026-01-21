const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Simple in-memory user storage (for demo)
let users = [];

// Registration endpoint
app.post('/api/register', (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, gender, country } = req.body;
    
    console.log('Registration attempt:', { first_name, last_name, email, phone, gender, country });
    
    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      first_name,
      last_name,
      email,
      phone,
      password, // In production, hash this password!
      gender,
      country,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    console.log('User registered successfully:', newUser);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('Login successful:', user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: users.map(u => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      gender: u.gender,
      country: u.country
    }))
  });
});

// Serve the registration page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'registration.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Registration page: http://localhost:${PORT}`);
  console.log(`🔐 API endpoints:`);
  console.log(`   POST /api/register - Register new user`);
  console.log(`   POST /api/login - Login user`);
  console.log(`   GET /api/users - View all users`);
});
