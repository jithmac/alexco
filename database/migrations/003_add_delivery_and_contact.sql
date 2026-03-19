-- Migration: Add delivery_method column and contact_messages table
-- Date: 2026-02-xx (retroactive)

-- Add delivery_method to sales_orders
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'sales_orders' AND column_name = 'delivery_method');
SET @sql := IF(@exist = 0, 'ALTER TABLE sales_orders ADD COLUMN delivery_method VARCHAR(20) DEFAULT ''delivery''', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);
