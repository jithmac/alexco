-- Alexco Platform - Server Database Fixes
-- This script fixes category creation and the "Newest" product filter.

-- 1. Fix Category Manage Permission Data
-- The permission was failing because the 'code' column was empty.
UPDATE permissions SET code = 'categories.manage' WHERE id = 'categories.manage';

-- 2. Add Missing Columns to Products for "Newest" sorting
-- These columns are required for the newest-to-oldest sorting logic.
SET @exist_created := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'created_at');
SET @sql_created := IF(@exist_created = 0, 'ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt1 FROM @sql_created; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

SET @exist_updated := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'updated_at');
SET @sql_updated := IF(@exist_updated = 0, 'ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt2 FROM @sql_updated; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- 3. Ensure Categories have the is_active column
-- Required for store filter queries.
SET @exist_active := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'categories' AND column_name = 'is_active');
SET @sql_active := IF(@exist_active = 0, 'ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE', 'SELECT 1');
PREPARE stmt3 FROM @sql_active; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- 4. Fix any other permissions with empty codes that match their ID
UPDATE permissions SET code = id WHERE (code = '' OR code IS NULL) AND id LIKE '%.%';
