require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2');

const host = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
const user = process.env.DB_USER || process.env.MYSQL_USER || process.env.DB_USERNAME || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
const database = process.env.DB_NAME || process.env.DB_DATABASE || process.env.MYSQL_DATABASE;

if (!database) {
  console.warn('Warning: no database configured in env (DB_NAME / DB_DATABASE / MYSQL_DATABASE)');
}

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,           // <- ensures "USE <db>" for queries
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
