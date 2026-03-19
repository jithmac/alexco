-- VPS Fix Script (Simple Version)
-- Run this with the -f flag to ignore errors if properites already exist
-- Example: mysql -u root -p alexco_db -f < scripts/vps_simple_fix.sql

-- 1. Attempt to add columns (will error if they exist, which is fine)
ALTER TABLE employees ADD COLUMN epf_employee_rate DECIMAL(5,2) DEFAULT 8.00;
ALTER TABLE employees ADD COLUMN epf_employer_rate DECIMAL(5,2) DEFAULT 12.00;
ALTER TABLE employees ADD COLUMN etf_employer_rate DECIMAL(5,2) DEFAULT 3.00;
ALTER TABLE employees ADD COLUMN epf_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN etf_number VARCHAR(50);

-- 2. Insert Permissions (swallows duplicates)
INSERT IGNORE INTO permissions (id, description) VALUES 
('categories.manage', 'Manage Categories'),
('inventory.view', 'View Inventory'),
('inventory.manage', 'Manage Inventory'),
('admin.view', 'Access Admin Dashboard'),
('payroll.view', 'View Payroll'),
('admin.settings', 'Manage Settings'),
('reports.view', 'View Reports');

-- 3. Assign Permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug IN ('admin', 'super_user')
AND p.id IN (
    'categories.manage', 
    'inventory.view', 
    'inventory.manage', 
    'admin.view', 
    'payroll.view', 
    'admin.settings',
    'reports.view'
);
