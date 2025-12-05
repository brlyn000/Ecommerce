-- Manual SQL script to update comments table
-- Run this in your MySQL database

USE ecommerce_db;

-- Add new columns to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS comment_type ENUM('review', 'comment') DEFAULT 'comment',
ADD COLUMN IF NOT EXISTS user_id INT NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Update existing comments to have default comment_type
UPDATE comments SET comment_type = 'comment' WHERE comment_type IS NULL;

-- Show the updated table structure
DESCRIBE comments;