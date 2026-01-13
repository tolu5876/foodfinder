// Demo API endpoints - no database required
// This will work on Vercel without database connection issues

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    const data = JSON.parse(req.body);
    
    if (req.url === '/api/logout') {
      // Demo logout - always succeeds
      res.status(200).json({
        success: true,
        message: 'Logged out successfully! (Demo Mode)'
      });
    } else {
      res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
