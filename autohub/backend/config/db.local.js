require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2');

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

const db = mysql.createConnection({ host, user, password, database, port });
db.connect((err) => {
  if (err) {
    console.error(' Local DB connection failed:', err.message);
    process.exit(1);
  } else {
    console.log(' Local DB connected successfully.');
  }
});

module.exports = db;
