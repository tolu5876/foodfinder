// ============================================
// UNIFIED AUTHENTICATION API
// ============================================
// Single serverless function handling all auth routes

const { User, Security } = require('./database');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const path = req.url?.split('?')[0] || '/api/auth';
    
    // Route based on path
    if (path.includes('/register') || req.body?.action === 'register') {
      return handleRegister(req, res);
    } else if (path.includes('/login') || req.body?.action === 'login') {
      return handleLogin(req, res);
    } else if (path.includes('/logout') || req.body?.action === 'logout') {
      return handleLogout(req, res);
    } else if (path.includes('/validate') || req.body?.action === 'validate') {
      return handleValidateSession(req, res);
    } else {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const user = new User();
    
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }
    
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid JSON data' });
    }
    
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'password', 'gender', 'country'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: `${field.replace('_', ' ')} is required` 
        });
      }
    }
    
    if (!Security.validateEmail(data.email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    
    if (!Security.validatePhone(data.phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }
    
    if (data.password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    const sanitizedData = {
      first_name: Security.sanitizeInput(data.first_name),
      last_name: Security.sanitizeInput(data.last_name),
      email: Security.sanitizeInput(data.email.toLowerCase()),
      phone: Security.sanitizeInput(data.phone),
      password: data.password,
      gender: Security.sanitizeInput(data.gender),
      country: Security.sanitizeInput(data.country)
    };
    
    const result = await user.register(sanitizedData);
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const user = new User();
    
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }
    
    if (!data || !data.email_or_phone || !data.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/phone and password required' 
      });
    }
    
    const result = await user.login(data.email_or_phone, data.password, data.device_id);
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}

async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const user = new User();
    
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }
    
    if (!data || !data.session_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID required' 
      });
    }
    
    const result = await user.logout(data.session_id);
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}

async function handleValidateSession(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const user = new User();
    
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }
    
    if (!data || !data.session_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID required' 
      });
    }
    
    const result = await user.validateSession(data.session_id);
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
}
