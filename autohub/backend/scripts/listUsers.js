const db = require('../config/db');

async function listUsers() {
  try {
    const [users] = await db.promise().query('SELECT id, username, email, role FROM users ORDER BY id');
    
    console.log('\n=== ALL USERS IN DATABASE ===\n');
    console.log('Note: Passwords are hashed, you cannot retrieve original passwords.');
    console.log('For testing, you can use the registration page to create new accounts.\n');
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role || 'user'}`);
      console.log('---');
    });
    
    console.log(`\nTotal users: ${users.length}\n`);
    
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    db.end();
  }
}

listUsers();
