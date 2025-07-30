const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP password is blank
  database: 'autohub_db',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL database!');
  }
});

module.exports = db;
