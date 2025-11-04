#!/usr/bin/env node

/**
 * Database Migration Script
 * Applies schema fixes to align database with application code
 * Run from: autohub/backend/
 * Command: node migrations/run_migration.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 AutoHub Database Migration Tool\n');
console.log('='.repeat(50));

// Read the migration file
const migrationFile = path.join(__dirname, 'fix_schema_mismatches.sql');
let migrationSQL;

try {
  migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  console.log('✅ Migration file loaded successfully\n');
} catch (error) {
  console.error('❌ Failed to read migration file:', error.message);
  process.exit(1);
}

// Split into individual queries
const queries = migrationSQL
  .split(';')
  .map(q => q.trim())
  .filter(q => {
    // Filter out comments and empty queries
    return q.length > 0 && 
           !q.startsWith('--') && 
           !q.startsWith('/*') &&
           !q.toLowerCase().startsWith('use ') &&
           !q.toLowerCase().startsWith('describe') &&
           !q.toLowerCase().startsWith('select ');
  });

console.log(`📋 Found ${queries.length} migration queries to execute\n`);

async function runMigration() {
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const queryPreview = query.substring(0, 60).replace(/\s+/g, ' ') + '...';
    
    console.log(`\n[${i + 1}/${queries.length}] Executing: ${queryPreview}`);
    
    try {
      await db.promise().query(query);
      console.log('  ✅ Success');
      successCount++;
    } catch (error) {
      // Handle expected errors (like duplicate columns)
      if (error.message.includes('Duplicate column') || 
          error.message.includes('already exists') ||
          error.sqlState === '42S21') {
        console.log('  ⚠️  Already exists, skipping...');
        skipCount++;
      } else if (error.message.includes('check that column') ||
                 error.message.includes('Unknown column')) {
        console.log('  ⚠️  Column reference issue, may need manual review');
        console.log('     Error:', error.message);
        skipCount++;
      } else {
        console.error('  ❌ Error:', error.message);
        console.error('     SQL State:', error.sqlState);
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  // Verify the changes
  console.log('🔍 Verifying schema changes...\n');
  
  try {
    // Check posts table
    const [postsColumns] = await db.promise().query('DESCRIBE posts');
    const hasImageUrl = postsColumns.some(col => col.Field === 'image_url');
    console.log(`Posts table - image_url column: ${hasImageUrl ? '✅ Present' : '❌ Missing'}`);
    
    // Check users table
    const [usersColumns] = await db.promise().query('DESCRIBE users');
    const hasPasswordHash = usersColumns.some(col => col.Field === 'password_hash');
    const hasProfileImage = usersColumns.some(col => col.Field === 'profile_image');
    console.log(`Users table - password_hash column: ${hasPasswordHash ? '✅ Present' : '❌ Missing'}`);
    console.log(`Users table - profile_image column: ${hasProfileImage ? '✅ Present' : '❌ Missing'}`);
    
    // Check listings table
    const [listingsColumns] = await db.promise().query('DESCRIBE listings');
    const hasStatus = listingsColumns.some(col => col.Field === 'status');
    const hasImages = listingsColumns.some(col => col.Field === 'images');
    console.log(`Listings table - status column: ${hasStatus ? '✅ Present' : '❌ Missing'}`);
    console.log(`Listings table - images column: ${hasImages ? '✅ Present' : '❌ Missing'}`);
    
    // Check post_likes table
    const [tables] = await db.promise().query("SHOW TABLES LIKE 'post_likes'");
    const hasPostLikes = tables.length > 0;
    console.log(`Post_likes table: ${hasPostLikes ? '✅ Present' : '⚠️  Missing (may not be needed yet)'}`);
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }

  console.log('\n✅ Migration process completed!\n');
  
  // Close database connection
  db.end();
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the migration
runMigration().catch(error => {
  console.error('\n❌ Fatal error during migration:', error);
  db.end();
  process.exit(1);
});
