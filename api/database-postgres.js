const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://username:password@localhost:5432/foodfinder',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
});

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
    this.pool = pool;
  }
  
  async register(userData) {
    const client = await this.pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1 OR phone = $2',
        [userData.email, userData.phone]
      );
      
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'Email or phone number already registered!' };
      }
      
      // Insert new user
      const userId = 'user_' + Date.now() + '_' + uuidv4();
      const hashedPassword = await Security.hashPassword(userData.password);
      
      const result = await client.query(
        `INSERT INTO users (user_id, first_name, last_name, email, phone, password, gender, country) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
      
      if (result.rowCount > 0) {
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
    } finally {
      client.release();
    }
  }
  
  async login(emailOrPhone, password, deviceId) {
    const client = await this.pool.connect();
    try {
      // Find user by email or phone
      const userResult = await client.query(
        'SELECT * FROM users WHERE (email = $1 OR phone = $2) AND is_active = true',
        [emailOrPhone, emailOrPhone]
      );
      
      if (userResult.rows.length === 0) {
        return { success: false, message: 'Email/Phone or password is incorrect!' };
      }
      
      const user = userResult.rows[0];
      
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
      await client.query(
        'UPDATE user_sessions SET is_active = false WHERE device_id = $1 AND user_id = $2',
        [deviceId, user.user_id]
      );
      
      // Insert new session
      const sessionResult = await client.query(
        `INSERT INTO user_sessions (user_id, device_id, session_token, expires_at, device_info, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.user_id,
          deviceId,
          sessionToken,
          expiresAt,
          'web_browser',
          '127.0.0.1'
        ]
      );
      
      if (sessionResult.rowCount > 0) {
        // Update last login
        await client.query(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
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
    } finally {
      client.release();
    }
  }
  
  async validateSession(sessionToken, deviceId) {
    const client = await this.pool.connect();
    try {
      const sessions = await client.query(
        `SELECT s.*, u.first_name, u.last_name, u.email, u.phone 
         FROM user_sessions s 
         JOIN users u ON s.user_id = u.user_id 
         WHERE s.session_token = $1 AND s.device_id = $2 
         AND s.is_active = true AND s.expires_at > NOW() AND u.is_active = true`,
        [sessionToken, deviceId]
      );
      
      if (sessions.rows.length > 0) {
        const session = sessions.rows[0];
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
    } finally {
      client.release();
    }
  }
  
  async logout(sessionToken, deviceId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'UPDATE user_sessions SET is_active = false WHERE session_token = $1 AND device_id = $2',
        [sessionToken, deviceId]
      );
      
      if (result.rowCount > 0) {
        return { success: true, message: 'Logged out successfully!' };
      } else {
        return { success: false, message: 'Logout failed!' };
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Database error: ' + error.message };
    } finally {
      client.release();
    }
  }
}

// Database setup function
async function setupDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
        country VARCHAR(100) NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    
    // Create user_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        device_id VARCHAR(255) NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        device_info TEXT,
        ip_address VARCHAR(45)
      )
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_device ON user_sessions(device_id)');
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  Security,
  User,
  setupDatabase,
  pool
};
