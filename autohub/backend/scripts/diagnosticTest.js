const mysql = require('mysql2');
require('dotenv').config();

console.log('🔧 AutoHub Database Diagnostic Test');
console.log('=====================================');

// Test database connection with different configurations
const configs = [
  {
    name: 'Default Config',
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: 3306
  },
  {
    name: 'XAMPP Default',
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306
  },
  {
    name: 'WAMP Default',
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port: 3306
  }
];

async function testConnection(config) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${config.name}...`);
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '[SET]' : '[EMPTY]'}`);
    console.log(`   Port: ${config.port}`);
    
    const connection = mysql.createConnection(config);
    
    connection.connect((err) => {
      if (err) {
        console.log(`   ❌ Failed: ${err.code} - ${err.message}`);
        resolve({ success: false, error: err });
      } else {
        console.log(`   ✅ Success! Connected to MySQL.`);
        
        // Test if autohub_db exists
        connection.query('SHOW DATABASES LIKE "autohub_db"', (err, results) => {
          if (err) {
            console.log(`   ⚠️  Connected but can't check databases: ${err.message}`);
          } else if (results.length === 0) {
            console.log(`   ⚠️  Connected but 'autohub_db' database doesn't exist`);
          } else {
            console.log(`   ✅ Database 'autohub_db' exists!`);
          }
          
          connection.end();
          resolve({ success: true, config });
        });
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      connection.destroy();
      console.log(`   ⏰ Connection timeout`);
      resolve({ success: false, error: 'Timeout' });
    }, 5000);
  });
}

async function runDiagnostic() {
  let workingConfig = null;
  
  for (const config of configs) {
    const result = await testConnection(config);
    if (result.success && !workingConfig) {
      workingConfig = result.config;
    }
  }
  
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('====================');
  
  if (workingConfig) {
    console.log('✅ Found working MySQL connection!');
    console.log(`   Using: ${workingConfig.name}`);
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with the working configuration');
    console.log('2. Run the database setup script');
    console.log('3. Test adding a vehicle to your garage');
  } else {
    console.log('❌ No working MySQL connection found.');
    console.log('\n📝 Troubleshooting steps:');
    console.log('1. Check if MySQL/XAMPP/WAMP is running');
    console.log('2. Verify MySQL is running on port 3306');
    console.log('3. Check your MySQL username and password');
    console.log('4. Make sure MySQL service is started');
  }
  
  console.log('\n💡 Common solutions:');
  console.log('- Start XAMPP Control Panel and start MySQL');
  console.log('- Start WAMP and make sure MySQL is green');
  console.log('- Check Windows Services for MySQL');
  console.log('- Try connecting with MySQL Workbench or phpMyAdmin');
}

runDiagnostic().catch(console.error);