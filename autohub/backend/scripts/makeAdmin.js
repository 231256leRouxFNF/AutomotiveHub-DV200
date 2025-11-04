const db = require('../config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function makeAdmin() {
  try {
    // Get all users
    const [users] = await db.promise().query('SELECT id, username, email, role FROM users ORDER BY id');
    
    console.log('\n=== ALL USERS ===\n');
    users.forEach(user => {
      const roleLabel = user.role === 'admin' ? ' [ADMIN]' : '';
      console.log(`ID: ${user.id} | Username: ${user.username} | Email: ${user.email}${roleLabel}`);
    });
    
    rl.question('\nEnter the user ID to make admin: ', async (userId) => {
      const id = parseInt(userId);
      
      if (isNaN(id)) {
        console.log('❌ Invalid user ID');
        db.end();
        rl.close();
        return;
      }
      
      const user = users.find(u => u.id === id);
      if (!user) {
        console.log('❌ User not found');
        db.end();
        rl.close();
        return;
      }
      
      if (user.role === 'admin') {
        console.log(`⚠️ User "${user.username}" is already an admin`);
        db.end();
        rl.close();
        return;
      }
      
      // Update user to admin
      await db.promise().query('UPDATE users SET role = ? WHERE id = ?', ['admin', id]);
      
      console.log(`✅ Success! User "${user.username}" is now an admin`);
      console.log(`\nLogin credentials:`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`\nYou can now access the admin panel at: /admin`);
      
      db.end();
      rl.close();
    });
    
  } catch (error) {
    console.error('Error:', error);
    db.end();
    rl.close();
  }
}

makeAdmin();
