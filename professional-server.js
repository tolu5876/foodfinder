const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Helper functions
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('Users saved successfully');
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  saveUsers([]);
  console.log('Created users.json file');
}

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
    
    // Load existing users
    const users = loadUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log('Registration failed: User already exists', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists. Please use a different email or login.'
      });
    }
    
    // Create new user with hashed password
    const hashedPassword = hashPassword(password);
    const newUser = {
      id: Date.now().toString(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      gender: gender || '',
      country: country || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    
    console.log('User registered successfully:', { 
      id: newUser.id, 
      first_name: newUser.first_name, 
      last_name: newUser.last_name, 
      email: newUser.email 
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account has been created.',
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        country: newUser.country
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Load users
    const users = loadUsers();
    
    // Find user by email
    const user = users.find(u => u.email === email.trim().toLowerCase());
    
    if (!user) {
      console.log('Login failed: User not found', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }
    
    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      console.log('Login failed: Invalid password', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }
    
    console.log('Login successful:', { 
      id: user.id, 
      first_name: user.first_name, 
      email: user.email 
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        country: user.country
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

// Get all users (for testing)
app.get('/api/users', (req, res) => {
  try {
    const users = loadUsers();
    const safeUsers = users.map(u => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      gender: u.gender,
      country: u.country,
      created_at: u.created_at
    }));
    
    res.json({
      success: true,
      message: `Found ${safeUsers.length} users`,
      users: safeUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Delete user (for testing)
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const users = loadUsers();
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    saveUsers(users);
    
    console.log('User deleted:', deletedUser.email);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Serve the registration page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'registration.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'logino.html'));
});

app.listen(PORT, () => {
  console.log('🚀 Professional FoodieFindr Backend Started!');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📝 Registration: http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log(`📊 Users API: http://localhost:${PORT}/api/users`);
  console.log(`💾 Users saved to: ${USERS_FILE}`);
  console.log('✅ Features: Permanent storage, duplicate prevention, password hashing');
});
