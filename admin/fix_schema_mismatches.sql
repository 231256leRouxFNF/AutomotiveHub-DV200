-- ============================================
-- AutoHub Database Schema Fix Migration
-- Date: November 4, 2025
-- Purpose: Fix critical schema mismatches between database and application code
-- ============================================

USE autohub_db;

-- ============================================
-- 1. FIX POSTS TABLE
-- ============================================

-- Add image_url column if it doesn't exist
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT NULL AFTER content;

-- Add profile_image column to users table for post queries
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) DEFAULT NULL AFTER email;

-- ============================================
-- 2. FIX LISTINGS TABLE
-- ============================================

-- Add missing status column
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' AFTER location;

-- Add missing images column (JSON)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS images JSON DEFAULT NULL AFTER status;

-- ============================================
-- 3. CREATE POST_LIKES TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS post_likes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  postId INT(11) NOT NULL,
  userId INT(11) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_like (postId, userId),
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 4. FIX EVENTS TABLE (standardize columns)
-- ============================================

-- Ensure events table has correct columns
ALTER TABLE events
MODIFY COLUMN IF EXISTS time TIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS imageUrl VARCHAR(255) DEFAULT NULL AFTER location;

-- ============================================
-- 5. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================

-- Add index on posts.user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Add index on listings.userId for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_userId ON listings(userId);

-- Add index on events.userId for faster queries
CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check posts table structure
DESCRIBE posts;

-- Check listings table structure
DESCRIBE listings;

-- Check users table structure
DESCRIBE users;

-- Check events table structure
DESCRIBE events;

SELECT 'Migration completed successfully!' as status;
