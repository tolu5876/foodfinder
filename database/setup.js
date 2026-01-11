// Database setup for FoodFinder Authentication System
// Run this script to create the necessary tables

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'foodfinder',
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL (without specifying database first)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database '${dbConfig.database}' created or already exists`);
    
    // Switch to the foodfinder database
    await connection.changeUser({ database: dbConfig.database });
    console.log('Switched to foodfinder database');
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        country VARCHAR(100) NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('Users table created or already exists');
    
    // Create user_sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        device_id VARCHAR(255) NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        device_info TEXT NULL,
        ip_address VARCHAR(45) NULL,
        INDEX idx_user_session (user_id, is_active),
        INDEX idx_session_token (session_token),
        INDEX idx_device_id (device_id)
      )
    `);
    console.log('User sessions table created or already exists');
    
    // Create password_resets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        INDEX idx_reset_token (reset_token),
        INDEX idx_email (email)
      )
    `);
    console.log('Password resets table created or already exists');
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your environment variables with database credentials');
    console.log('2. Deploy to Vercel');
    console.log('3. Test the authentication system');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
