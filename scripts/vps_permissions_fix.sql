-- VPS Permissions Fix - Dedicated Script (v2)
-- Run: mysql -u root -p alexco_db -f < scripts/vps_permissions_fix.sql

-- 1. Ensure Permissions Exist (Populating 'code' column as well to match 'id')
REPLACE INTO permissions (id, code, description, group_name) VALUES ('categories.manage', 'categories.manage', 'Manage Categories', 'System');
REPLACE INTO permissions (id, code, description, group_name) VALUES ('inventory.view', 'inventory.view', 'View Inventory', 'System');
REPLACE INTO permissions (id, code, description, group_name) VALUES ('inventory.manage', 'inventory.manage', 'Manage Inventory', 'System');
REPLACE INTO permissions (id, code, description, group_name) VALUES ('admin.view', 'admin.view', 'Access Admin Dashboard', 'System');
REPLACE INTO permissions (id, code, description, group_name) VALUES ('payroll.view', 'payroll.view', 'View Payroll', 'System');
REPLACE INTO permissions (id, code, description, group_name) VALUES ('admin.settings', 'admin.settings', 'Manage Settings', 'System');
REPLACE INTO permissions (id, code, description, group_name) VALUES ('reports.view', 'reports.view', 'View Reports', 'System');

-- 2. Clear old/bad links for these specific roles and permissions to avoid duplicates
DELETE FROM role_permissions 
WHERE role_id IN (SELECT id FROM roles WHERE slug IN ('admin', 'super_user'))
AND permission_id IN ('categories.manage', 'inventory.view', 'inventory.manage', 'admin.view', 'payroll.view', 'admin.settings', 'reports.view');

-- 3. Link Admin Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'admin'
AND p.id IN ('categories.manage', 'inventory.view', 'inventory.manage', 'admin.view', 'payroll.view', 'admin.settings', 'reports.view');

-- 4. Link Super User Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.slug = 'super_user'
AND p.id IN ('categories.manage', 'inventory.view', 'inventory.manage', 'admin.view', 'payroll.view', 'admin.settings', 'reports.view');

-- 5. Verification Output
SELECT "--- VERIFICATION ---" as Status;
SELECT r.slug as Role, p.id as Permission
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.slug IN ('admin', 'super_user')
AND p.id IN ('categories.manage', 'inventory.view', 'payroll.view') -- checking key ones
ORDER BY r.slug, p.id;
