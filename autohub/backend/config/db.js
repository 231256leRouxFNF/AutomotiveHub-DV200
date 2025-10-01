const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autohub_db',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.log('Server will continue running. Please check your MySQL server and database configuration.');
  } else {
    console.log('Connected to MySQL database!');
  }
});

module.exports = db;
