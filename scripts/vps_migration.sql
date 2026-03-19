-- Fix for older MySQL versions that don't support IF NOT EXISTS in ALTER TABLE

DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(255),
    IN colName VARCHAR(255),
    IN colDef VARCHAR(255)
)
BEGIN
    DECLARE colCount INT;
    
    SELECT COUNT(*) INTO colCount 
    FROM information_schema.columns 
    WHERE table_name = tableName 
    AND column_name = colName 
    AND table_schema = DATABASE();
    
    IF colCount = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', colName, ' ', colDef);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

-- 1. Add missing columns to employees
CALL AddColumnIfNotExists('employees', 'epf_employee_rate', 'DECIMAL(5,2) DEFAULT 8.00');
CALL AddColumnIfNotExists('employees', 'epf_employer_rate', 'DECIMAL(5,2) DEFAULT 12.00');
CALL AddColumnIfNotExists('employees', 'etf_employer_rate', 'DECIMAL(5,2) DEFAULT 3.00');
CALL AddColumnIfNotExists('employees', 'epf_number', 'VARCHAR(50)');
CALL AddColumnIfNotExists('employees', 'etf_number', 'VARCHAR(50)');

-- Cleanup
DROP PROCEDURE AddColumnIfNotExists;

-- 2. Insert Missing Permissions
INSERT IGNORE INTO permissions (id, description) VALUES 
('categories.manage', 'Manage Categories'),
('inventory.view', 'View Inventory'),
('inventory.manage', 'Manage Inventory'),
('admin.view', 'Access Admin Dashboard'),
('payroll.view', 'View Payroll'),
('admin.settings', 'Manage Settings'),
('reports.view', 'View Reports');

-- 3. Assign Permissions to Roles (Admin & Super User)
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
