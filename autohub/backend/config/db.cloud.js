require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'autohub_db';

if (!database) {
  console.error('FATAL: No cloud database configured in environment variables');
  process.exit(1);
}

console.log('Cloud Database Configuration:', {
  host,
  port,
  user,
  database: database ? '✓ Set' : '✗ Missing',
  password: password ? '✓ Set' : '✗ Missing',
  environment: process.env.NODE_ENV || 'production'
});

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000, // 20 seconds
  acquireTimeout: 20000  // 20 seconds
});
console.log(' Cloud DB pool created.');
module.exports = pool;
