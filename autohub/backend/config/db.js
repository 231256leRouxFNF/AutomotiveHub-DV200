require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2');
const express = require('express');
const app = express();

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
  password: password ? '✓ Set' : '✗ Missing'
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
  connectTimeout: 60000, // 60 seconds for Cloud SQL
  // Important for Cloud SQL connections
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test the connection
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
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

// Health check endpoint with detailed diagnostics
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'unknown'
  };

  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
    res.json(health);
  } catch (error) {
    health.status = 'error';
    health.database = 'disconnected';
    health.error = error.message;
    res.status(500).json(health);
  }
});

// Export promisified pool
module.exports = pool.promise();
