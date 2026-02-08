const DB = require('./database');

// Create logs table if it doesn't exist
const createTableSQL = `
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  app_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  timestamp DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_id (device_id),
  INDEX idx_timestamp (timestamp)
)
`;

DB.query(createTableSQL, (err) => {
  if (err) {
    console.error('Failed to create logs table:', err);
    process.exit(1);
  }
  console.log('✓ Logs table created or already exists');
  
  // Check table structure
  DB.query('DESCRIBE logs', (err, results) => {
    if (err) {
      console.error('Failed to describe logs table:', err);
      process.exit(1);
    }
    console.log('✓ Table structure:');
    console.table(results);
    process.exit(0);
  });
});
