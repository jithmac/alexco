-- VPS Diagnostic Script
-- Run: mysql -u root -p alexco_db < scripts/vps_diagnose.sql

SELECT "--- CHECKING COLUMNS ---" AS Diagnostics;
DESCRIBE employees;

SELECT "--- CHECKING ROLES ---" AS Diagnostics;
SELECT * FROM roles;

SELECT "--- CHECKING PERMISSIONS ---" AS Diagnostics;
SELECT * FROM permissions WHERE id IN ('payroll.view', 'inventory.view', 'categories.manage');

SELECT "--- CHECKING ROLE PERMISSIONS ---" AS Diagnostics;
SELECT r.slug as role_slug, p.id as permission 
FROM role_permissions rp 
JOIN roles r ON rp.role_id = r.id 
JOIN permissions p ON rp.permission_id = p.id 
WHERE p.id IN ('payroll.view', 'inventory.view');

SELECT "--- CHECKING USERS ---" AS Diagnostics;
SELECT id, username, email, role_id FROM users;
