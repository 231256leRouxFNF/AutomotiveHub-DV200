const bcrypt = require('bcrypt');
const db = require('../config/db');

const testUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    username: 'jane_admin', 
    email: 'jane@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'mike_cars',
    email: 'mike@example.com', 
    password: 'mike123',
    role: 'user'
  }
];

async function createTestUsers() {
  console.log('Creating test users with proper password hashes...');
  
  try {
    for (const user of testUsers) {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      // Update the user with the proper hash
      const sql = `
        UPDATE users 
        SET password_hash = ?, role = ?
        WHERE username = ? AND email = ?
      `;
      
      await new Promise((resolve, reject) => {
        db.query(sql, [hashedPassword, user.role, user.username, user.email], (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Updated user: ${user.username} (${user.email})`);
            resolve(result);
          }
        });
      });
    }
    
    console.log('\n🎉 All test users updated successfully!');
    console.log('\nLogin credentials:');
    testUsers.forEach(user => {
      console.log(`- Username: ${user.username} | Email: ${user.email} | Password: ${user.password} | Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    db.end();
  }
}

createTestUsers();