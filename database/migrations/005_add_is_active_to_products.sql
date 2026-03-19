-- Migration: Add is_active column to products
-- Date: 2026-02-xx (retroactive — from database/add_is_active_to_products.sql)

SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'is_active');
SET @sql := IF(@exist = 0, 'ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
