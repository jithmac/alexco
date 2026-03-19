-- Seed Default Location for Inventory (Corrected)
-- Run this on VPS: mysql -u root -p alexco_db < seed-location.sql

USE alexco_db;

-- 1. Insert Default Location if table is empty
INSERT INTO locations (id, name, type)
SELECT UUID(), 'Main Warehouse', 'Warehouse'
WHERE NOT EXISTS (SELECT 1 FROM locations);

SELECT * FROM locations;
