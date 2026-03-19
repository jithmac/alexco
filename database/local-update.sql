-- SAFE UPDATE SCRIPT FOR LOCAL DATABASE
-- Run this to add missing columns without losing data

USE alexco_db;

-- 1. Add 'gallery' column
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'gallery');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN gallery JSON', 'SELECT "Column gallery already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add 'image' column
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'image');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN image TEXT', 'SELECT "Column image already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add 'specifications'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'specifications');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN specifications JSON', 'SELECT "Column specifications already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add 'features'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'features');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN features JSON', 'SELECT "Column features already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Add 'whats_included'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'whats_included');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN whats_included JSON', 'SELECT "Column whats_included already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Add 'long_description'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'long_description');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN long_description TEXT', 'SELECT "Column long_description already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Add 'price_cost'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'price_cost');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN price_cost DECIMAL(10,2) DEFAULT 0', 'SELECT "Column price_cost already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. Add 'price_sale'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'price_sale');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN price_sale DECIMAL(10,2) DEFAULT 0', 'SELECT "Column price_sale already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Add 'weight_g'
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'alexco_db' AND table_name = 'products' AND column_name = 'weight_g');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN weight_g INT DEFAULT 0', 'SELECT "Column weight_g already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT "Local Database Verified: All columns present." as status;
