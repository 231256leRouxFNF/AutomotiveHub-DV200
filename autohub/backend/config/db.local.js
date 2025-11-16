require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const host = process.env.LOCAL_DB_HOST || 'localhost';
const port = Number(process.env.LOCAL_DB_PORT || 3306);
const user = process.env.LOCAL_DB_USER || 'root';
const password = process.env.LOCAL_DB_PASSWORD || '';
const database = process.env.LOCAL_DB_NAME || 'autohub_db';

if (!database) {
  console.error('FATAL: No local database configured in environment variables');
  process.exit(1);
}

console.log('Local Database Configuration:', {
  host,
  port,
  user,
  database: database ? '✓ Set' : '✗ Missing',
  password: password ? '✓ Set' : '✗ Missing',
  environment: process.env.NODE_ENV || 'development'
});

const pool = mysql.createPool({ host, user, password, database, port, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
console.log(' Local DB pool created.');
module.exports = pool;
