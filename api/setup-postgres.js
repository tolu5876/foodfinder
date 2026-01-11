const { setupDatabase } = require('./database-postgres');

module.exports = async (req, res) => {
  try {
    await setupDatabase();
    res.status(200).json({
      success: true,
      message: 'Database setup completed successfully!'
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Database setup failed: ' + error.message
    });
  }
};
