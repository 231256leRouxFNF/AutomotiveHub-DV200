# Database Schema Migration Guide

## Overview
This migration fixes critical schema mismatches between the database and application code that would cause the app to crash or fail.

## What Was Fixed

### ✅ 1. Users Table - Password Column
- **Issue**: Database had `password_hash` column, server code used `password`
- **Fix**: Updated all server code to use `password_hash`
- **Files Changed**: 
  - `routes/authRoutes.js`
  - `server.js` (registration, password change endpoints)

### ✅ 2. Posts Table - Column Naming & Missing Columns
- **Issue**: 
  - Database used `user_id`, server used `userId`
  - Missing `image_url` column
  - Missing `profile_image` column in users table
- **Fix**: 
  - Updated server.js to use `user_id` consistently
  - Migration adds `image_url` column to posts
  - Migration adds `profile_image` column to users
- **Files Changed**: `server.js` (all post-related queries)

### ✅ 3. Comments Table - Column Naming
- **Issue**: Database uses `post_id`, `user_id`, server sometimes used camelCase
- **Fix**: Updated server.js to use snake_case (`post_id`, `user_id`)
- **Files Changed**: `server.js` (comment endpoints)

### ✅ 4. Listings Table - Missing Columns
- **Issue**: Missing `images` (JSON) and `status` (VARCHAR) columns
- **Fix**: Migration adds these columns
- **SQL**: 
  ```sql
  ALTER TABLE listings ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  ALTER TABLE listings ADD COLUMN images JSON DEFAULT NULL;
  ```

### ✅ 5. Frontend Configuration
- **Issue**: Duplicate `REACT_APP_API_URL` in `.env` file
- **Fix**: Commented out localhost URL, kept production URL active
- **Files Changed**: `frontend/.env`

### ✅ 6. Post Likes Table
- **Issue**: Table may not exist
- **Fix**: Migration creates table if it doesn't exist
- **SQL**: Creates `post_likes` table with proper foreign keys

## How to Apply Migration

### Option 1: Using MySQL Workbench or phpMyAdmin
1. Open the SQL file: `migrations/fix_schema_mismatches.sql`
2. Copy and paste into your SQL editor
3. Execute the entire script
4. Check the output for "Migration completed successfully!"

### Option 2: Using MySQL Command Line
```bash
cd autohub/backend/migrations
mysql -u autohub_user -p -h 34.51.215.67 autohub_db < fix_schema_mismatches.sql
```

### Option 3: Using Node.js Script (Recommended for Remote DB)
Create and run this script:

```javascript
// Run from: autohub/backend/
const fs = require('fs');
const db = require('./config/db');

const migration = fs.readFileSync('./migrations/fix_schema_mismatches.sql', 'utf8');
const queries = migration.split(';').filter(q => q.trim().length > 0);

async function runMigration() {
  for (const query of queries) {
    try {
      await db.promise().query(query);
      console.log('✅ Query executed successfully');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('⚠️  Column already exists, skipping...');
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  }
  console.log('✅ Migration completed!');
  process.exit(0);
}

runMigration();
```

## Verification Steps

After running the migration:

1. **Check Posts Table**:
   ```sql
   DESCRIBE posts;
   -- Should show: id, user_id, content, image_url, privacy, created_at
   ```

2. **Check Users Table**:
   ```sql
   DESCRIBE users;
   -- Should show: id, username, email, password_hash, profile_image, role, created_at, etc.
   ```

3. **Check Listings Table**:
   ```sql
   DESCRIBE listings;
   -- Should show: ..., status, images, ...
   ```

4. **Test Registration**:
   - Try registering a new user
   - Should work without "Unknown column 'password'" error

5. **Test Login**:
   - Try logging in
   - Should authenticate successfully

6. **Test Post Creation**:
   - Create a post with an image
   - Should save without errors

## Rollback (If Needed)

If something goes wrong, you can manually remove the added columns:

```sql
ALTER TABLE posts DROP COLUMN IF EXISTS image_url;
ALTER TABLE users DROP COLUMN IF EXISTS profile_image;
ALTER TABLE listings DROP COLUMN IF EXISTS status;
ALTER TABLE listings DROP COLUMN IF EXISTS images;
DROP TABLE IF EXISTS post_likes;
```

## Notes

- The migration uses `IF NOT EXISTS` and `IF EXISTS` clauses to make it safe to run multiple times
- All code changes maintain backward compatibility with existing data
- No data is deleted or modified, only schema structure is updated

## Support

If you encounter any issues:
1. Check the MySQL error log
2. Verify database connection in `.env` files
3. Ensure you're using MySQL 5.7+ or MariaDB 10.2+
4. Check that your database user has ALTER TABLE privileges
