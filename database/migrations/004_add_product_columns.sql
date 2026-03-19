-- Migration: Add product detail columns
-- Date: 2026-02-xx (retroactive — consolidates local-update.sql / vps-update.sql)

SET @db = DATABASE();

-- gallery
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'gallery');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN gallery JSON', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- image
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'image');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN image TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- specifications
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'specifications');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN specifications JSON', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- features
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'features');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN features JSON', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- whats_included
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'whats_included');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN whats_included JSON', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- long_description
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'long_description');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN long_description TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- price_cost
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'price_cost');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN price_cost DECIMAL(10,2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- price_sale
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'price_sale');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN price_sale DECIMAL(10,2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weight_g
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db AND table_name = 'products' AND column_name = 'weight_g');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN weight_g INT DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
