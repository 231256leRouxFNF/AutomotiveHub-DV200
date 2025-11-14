require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'autohub_db';

if (!database) {
  console.error('FATAL: No database configured in environment variables');
  process.exit(1);
}

console.log('Database Configuration:', {
  host,
  port,
  user,
  database: database ? '✓ Set' : '✗ Missing',
  password: password ? '✓ Set' : '✗ Missing',
  environment: process.env.NODE_ENV || 'development'
});

// Create connection with mysql2
const db = mysql.createConnection({
  host,
  user,
  password,
  database,
  port
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error(' Database connection failed:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused. Check host and port.');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check username and password.');
    }
  } else {
    console.log(' Database connected successfully');
  }
});

const getVehicles = async (req, res) => {
  console.log('Fetching vehicles for user:', req.user?.id);
  try {
    // your existing query code
    console.log('Vehicles found:', vehicles.length);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
  }
};

// Export the connection
module.exports = db;
