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

// Create connection pool with promise wrapper
const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds (reduced from 60)
  acquireTimeout: 30000,
  timeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Important for Cloud SQL connections
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test the connection with retry logic
const testConnection = (retries = 3) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
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
      
      // Retry connection
      if (retries > 0) {
        console.log(`Retrying connection... (${retries} attempts left)`);
        setTimeout(() => testConnection(retries - 1), 5000);
      }
    } else {
      console.log('✅ Database connected successfully');
      connection.release();
    }
  });
};

testConnection();

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    testConnection();
  }
});

// Export promisified pool
module.exports = pool.promise();
