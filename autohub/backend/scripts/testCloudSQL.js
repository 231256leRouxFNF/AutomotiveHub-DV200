const mysql = require('mysql2');
require('dotenv').config();

console.log('🔧 Testing Cloud SQL Connection');
console.log('================================');

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

console.log(`Host: ${config.host}`);
console.log(`User: ${config.user}`);
console.log(`Database: ${config.database}`);
console.log(`Port: ${config.port}`);

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.log(`❌ Connection failed: ${err.code} - ${err.message}`);
    console.log('Troubleshooting:');
    console.log('1. Check if your IP is authorized in Cloud SQL Networking.');
    console.log('2. Verify the user and password in Cloud SQL Users.');
    console.log('3. Ensure the database exists.');
  } else {
    console.log('✅ Connected successfully!');
    connection.query('SHOW TABLES', (err, results) => {
      if (err) {
        console.log(`⚠️  Connected but can't list tables: ${err.message}`);
      } else {
        console.log(`📋 Tables in database: ${results.length}`);
        results.forEach(row => console.log(`   - ${Object.values(row)[0]}`));
      }
      connection.end();
    });
  }
});
