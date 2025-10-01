const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

// Read and execute database setup SQL
const setupSQL = fs.readFileSync('./database_setup.sql', 'utf8');

console.log('Setting up database with new tables...');

connection.query(setupSQL, (error, results) => {
  if (error) {
    console.error('Error setting up database:', error);
    return;
  }
  
  console.log('✅ Database setup completed successfully!');
  console.log('New tables created:');
  console.log('- vehicles (for user vehicles)');
  console.log('- vehicle_images (for vehicle images)');
  console.log('- events (for admin events)');
  console.log('- event_participants (for event participation)');
  
  connection.end();
});