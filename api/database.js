const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'foodfinder',
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Create database connection
let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
}

// Security functions
class Security {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
  
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
  
  static generateToken(length = 32) {
    return require('crypto').randomBytes(length).toString('hex');
  }
  
  static sanitizeInput(data) {
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, '');
    }
    return data;
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  }
}

// User management class
class User {
  constructor() {
    this.db = null;
  }
  
  async init() {
    this.db = await getConnection();
  }
  
  async register(userData) {
    try {
      await this.init();
      
      // Check if user already exists
      const [existingUsers] = await this.db.execute(
        'SELECT id FROM users WHERE email = ? OR phone = ?',
        [userData.email, userData.phone]
      );
      
      if (existingUsers.length > 0) {
        return { success: false, message: 'Email or phone number already registered!' };
      }
      
      // Insert new user
      const userId = 'user_' + Date.now() + '_' + uuidv4();
      const hashedPassword = await Security.hashPassword(userData.password);
      
      const [result] = await this.db.execute(
        `INSERT INTO users (user_id, first_name, last_name, email, phone, password, gender, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.phone,
          hashedPassword,
          userData.gender,
          userData.country
        ]
      );
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'Registration successful!',
          user_id: userId
        };
      } else {
        return { success: false, message: 'Registration failed!' };
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Database error: ' + error.message };
    }
  }
  
  async login(emailOrPhone, password, deviceId) {
    try {
      await this.init();
      
      // Find user by email or phone
      const [users] = await this.db.execute(
        'SELECT * FROM users WHERE (email = ? OR phone = ?) AND is_active = 1',
        [emailOrPhone, emailOrPhone]
      );
      
      if (users.length === 0) {
        return { success: false, message: 'Email/Phone or password is incorrect!' };
      }
      
      const user = users[0];
      
      // Verify password
      const isValidPassword = await Security.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Email/Phone or password is incorrect!' };
      }
      
      // Create session
      const sessionToken = Security.generateToken();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      // Deactivate old sessions for this device
      await this.db.execute(
        'UPDATE user_sessions SET is_active = 0 WHERE device_id = ? AND user_id = ?',
        [deviceId, user.user_id]
      );
      
      // Insert new session
      const [sessionResult] = await this.db.execute(
        `INSERT INTO user_sessions (user_id, device_id, session_token, expires_at, device_info, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.user_id,
          deviceId,
          sessionToken,
          expiresAt,
          'web_browser',
          '127.0.0.1'
        ]
      );
      
      if (sessionResult.affectedRows > 0) {
        // Update last login
        await this.db.execute(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
          [user.user_id]
        );
        
        return {
          success: true,
          message: 'Login successful!',
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone
          },
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        };
      } else {
        return { success: false, message: 'Failed to create session!' };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Database error: ' + error.message };
    }
  }
  
  async validateSession(sessionToken, deviceId) {
    try {
      await this.init();
      
      const [sessions] = await this.db.execute(
        `SELECT s.*, u.first_name, u.last_name, u.email, u.phone 
         FROM user_sessions s 
         JOIN users u ON s.user_id = u.user_id 
         WHERE s.session_token = ? AND s.device_id = ? 
         AND s.is_active = 1 AND s.expires_at > NOW() AND u.is_active = 1`,
        [sessionToken, deviceId]
      );
      
      if (sessions.length > 0) {
        const session = sessions[0];
        return {
          success: true,
          user: {
            user_id: session.user_id,
            first_name: session.first_name,
            last_name: session.last_name,
            email: session.email,
            phone: session.phone
          }
        };
      } else {
        return { success: false, message: 'Invalid or expired session!' };
      }
      
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, message: 'Database error: ' + error.message };
    }
  }
  
  async logout(sessionToken, deviceId) {
    try {
      await this.init();
      
      const [result] = await this.db.execute(
        'UPDATE user_sessions SET is_active = 0 WHERE session_token = ? AND device_id = ?',
        [sessionToken, deviceId]
      );
      
      if (result.affectedRows > 0) {
        return { success: true, message: 'Logged out successfully!' };
      } else {
        return { success: false, message: 'Logout failed!' };
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Database error: ' + error.message };
    }
  }
}

module.exports = {
  Security,
  User,
  getConnection
};
