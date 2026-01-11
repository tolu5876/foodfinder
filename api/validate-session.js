const { User, Security } = require('./database');

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
    if (!data.session_token || !data.device_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session token and device ID are required' 
      });
    }
    
    // Sanitize input data
    const sessionToken = Security.sanitizeInput(data.session_token);
    const deviceId = Security.sanitizeInput(data.device_id);
    
    // Validate session
    const result = await user.validateSession(sessionToken, deviceId);
    
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
