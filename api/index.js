// Simple in-memory user storage for Vercel
if (!global.foodfinderUsers) {
  global.foodfinderUsers = [];
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse body
    let data = req.body;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    } else if (Buffer.isBuffer(data)) {
      data = JSON.parse(data.toString('utf8'));
    }

    const { pathname } = new URL(req.url, 'http://localhost');

    // REGISTER
    if (pathname.includes('/register')) {
      const { first_name, last_name, email, phone, password, gender, country } = data || {};

      if (!first_name || !last_name || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: 'All fields required' });
      }

      // Check duplicates
      if (global.foodfinderUsers.find(u => u.email === email || u.phone === phone)) {
        return res.status(400).json({ success: false, message: 'Email or phone already registered' });
      }

      // Save user
      global.foodfinderUsers.push({
        id: Date.now().toString(),
        first_name, last_name, email, phone,
        password: 'hashed_' + password,
        gender, country
      });

      return res.json({ success: true, message: 'Registration successful!' });
    }

    // LOGIN
    if (pathname.includes('/login')) {
      const { email_or_phone, password } = data || {};

      if (!email_or_phone || !password) {
        return res.status(400).json({ success: false, message: 'Credentials required' });
      }

      const user = global.foodfinderUsers.find(u => 
        (u.email === email_or_phone || u.phone === email_or_phone) &&
        u.password === 'hashed_' + password
      );

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email/phone or password' });
      }

      return res.json({ 
        success: true, 
        message: 'Login successful!',
        user: { id: user.id, first_name: user.first_name, email: user.email }
      });
    }

    // CHECK USERS
    if (pathname.includes('/users')) {
      return res.json({ success: true, count: global.foodfinderUsers.length, users: global.foodfinderUsers });
    }

    return res.status(404).json({ success: false, message: 'Not found' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
