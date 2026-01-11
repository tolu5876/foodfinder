const { User, Security } = require('./database-postgres');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const user = new User();
    
    // Parse request body
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }
    
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid JSON data' });
    }
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'password', 'gender', 'country'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: `${field.replace('_', ' ')} is required` 
        });
      }
    }
    
    // Validate email
    if (!Security.validateEmail(data.email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    
    // Validate phone
    if (!Security.validatePhone(data.phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }
    
    // Validate password strength
    if (data.password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Sanitize input data
    const sanitizedData = {
      first_name: Security.sanitizeInput(data.first_name),
      last_name: Security.sanitizeInput(data.last_name),
      email: Security.sanitizeInput(data.email.toLowerCase()),
      phone: Security.sanitizeInput(data.phone),
      password: data.password, // Will be hashed in User class
      gender: Security.sanitizeInput(data.gender),
      country: Security.sanitizeInput(data.country)
    };
    
    // Register user
    const result = await user.register(sanitizedData);
    
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
