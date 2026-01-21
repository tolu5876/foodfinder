const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Simple function to save users to file
function saveUser(userData) {
  try {
    let users = [];
    
    // Load existing users if file exists
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(data);
    }
    
    // Check if user already exists - FIXED LOGIC
    const existingUser = users.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      console.log('❌ DUPLICATE EMAIL FOUND:', existingUser.email);
      return { success: false, message: 'User with this email already exists' };
    }
    
    // Add new user
    userData.id = Date.now().toString();
    userData.created_at = new Date().toISOString();
    users.push(userData);
    
    // Save to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    
    console.log('✅ User saved:', userData.email);
    console.log('📁 File updated:', USERS_FILE);
    
    return { success: true, message: 'Registration successful!' };
    
  } catch (error) {
    console.error('❌ Error saving user:', error);
    return { success: false, message: 'Error saving user data' };
  }
}

// Registration endpoint
app.post('/api/register', (req, res) => {
  console.log('📝 REGISTRATION REQUEST RECEIVED');
  console.log('📧 Request body:', req.body);
  
  const { first_name, last_name, email, phone, password, gender, country } = req.body;
  
  console.log('👤 Parsed data:', { first_name, last_name, email, phone, gender, country });
  
  // Validate required fields
  if (!first_name || !last_name || !email || !password) {
    console.log('❌ VALIDATION FAILED: Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Please fill all required fields'
    });
  }
  
  // Create user object
  const newUser = {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    password: password, // In production, hash this!
    gender: gender || '',
    country: country || ''
  };
  
  console.log('🔍 CHECKING FOR DUPLICATES...');
  console.log('📧 Email to check:', newUser.email);
  
  // Save user
  const result = saveUser(newUser);
  
  console.log('💾 SAVE RESULT:', result);
  
  if (result.success) {
    console.log('✅ REGISTRATION SUCCESSFUL');
    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account has been created.',
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email
      }
    });
  } else {
    console.log('❌ REGISTRATION FAILED:', result.message);
    res.status(400).json(result);
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  console.log('🔐 LOGIN REQUEST RECEIVED');
  console.log('📧 Request body:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('❌ LOGIN FAILED: Missing email or password');
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  try {
    // Load users from file
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(data);
      console.log(`📁 Loaded ${users.length} users from file`);
    } else {
      console.log('📁 No users file found - starting fresh');
    }
    
    // Find user by email (case insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    console.log('🔍 Looking for email:', normalizedEmail);
    
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      console.log('❌ LOGIN FAILED: User not found with email:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }
    
    console.log('👤 User found:', { email: user.email, id: user.id });
    console.log('🔑 Password check - comparing passwords...');
    
    // Check password (exact match)
    if (user.password !== password) {
      console.log('❌ LOGIN FAILED: Password does not match');
      console.log('🔑 Stored password length:', user.password.length);
      console.log('🔑 Provided password length:', password.length);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }
    
    console.log('✅ LOGIN SUCCESSFUL:', { email: user.email, id: user.id });
    
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
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

// View all users (for testing)
app.get('/api/users', (req, res) => {
  try {
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      users = JSON.parse(data);
    }
    
    res.json({
      success: true,
      message: `Found ${users.length} users`,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Serve registration page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'registration.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 FoodieFindr Backend Started!');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📝 Registration: http://localhost:${PORT}`);
  console.log(`📁 Users file: ${USERS_FILE}`);
  console.log('✅ Ready to save user data permanently!');
});
