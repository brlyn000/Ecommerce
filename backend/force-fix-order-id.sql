-- Force fix order_id column type
USE `e-commerce`;

-- Drop and recreate the column to ensure it's VARCHAR
ALTER TABLE notifications DROP COLUMN order_id;
ALTER TABLE notifications ADD COLUMN order_id VARCHAR(50) NULL AFTER product_id;