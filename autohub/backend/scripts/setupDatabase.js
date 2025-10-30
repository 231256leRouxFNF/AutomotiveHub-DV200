const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autohub_db',
  multipleStatements: true
});

// Read and execute database setup SQL
const setupSQL = fs.readFileSync('./database_setup.sql', 'utf8');

console.log('Setting up database with new tables...');

(async () => {
  try {
    const conn = await connection;
    await conn.query(setupSQL);

    console.log('✅ Database setup completed successfully!');
    console.log('New tables created:');
    console.log('- vehicles (for user vehicles)');
    console.log('- vehicle_images (for vehicle images)');
    console.log('- events (for admin events)');
    console.log('- event_participants (for event participation)');

    await conn.end();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
})();
