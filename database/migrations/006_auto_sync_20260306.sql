-- Auto-generated migration
-- Generated: 2026-03-06T13:24:49.992Z
-- Sync schema.sql → live database

-- ADD COLUMN: employees.created_at
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'employees' AND column_name = 'created_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE employees ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: employees.updated_at
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'employees' AND column_name = 'updated_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE employees ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.check_in_source
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'check_in_source');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN check_in_source ENUM(\'pos\', \'mobile\', \'manual\', \'biometric\') DEFAULT \'manual\'', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.check_out_source
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'check_out_source');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN check_out_source ENUM(\'pos\', \'mobile\', \'manual\', \'biometric\') DEFAULT \'manual\'', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.check_in_latitude
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'check_in_latitude');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN check_in_latitude DECIMAL(10, 8)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.check_in_longitude
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'check_in_longitude');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN check_in_longitude DECIMAL(11, 8)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.check_out_latitude
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'check_out_latitude');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN check_out_latitude DECIMAL(10, 8)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.check_out_longitude
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'check_out_longitude');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN check_out_longitude DECIMAL(11, 8)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.location_id
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'location_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN location_id CHAR(36)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.shift_id
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'shift_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN shift_id CHAR(36)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.ot_hours
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'ot_hours');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN ot_hours DECIMAL(5, 2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.ot_rate
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'ot_rate');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN ot_rate DECIMAL(3, 2) DEFAULT 1.5', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: attendance_logs.notes
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'attendance_logs' AND column_name = 'notes');
SET @sql := IF(@exist = 0, 'ALTER TABLE attendance_logs ADD COLUMN notes TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.commission
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'commission');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN commission DECIMAL(10, 2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.bonus
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'bonus');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN bonus DECIMAL(10, 2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.gross_salary
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'gross_salary');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN gross_salary DECIMAL(10, 2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.apit_tax
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'apit_tax');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN apit_tax DECIMAL(10, 2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.loan_deduction
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'loan_deduction');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN loan_deduction DECIMAL(10, 2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.other_deductions
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'other_deductions');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN other_deductions DECIMAL(10, 2) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.status
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'status');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN status ENUM(\'draft\', \'approved\', \'paid\') DEFAULT \'draft\'', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.approved_by
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'approved_by');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN approved_by CHAR(36)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.approved_at
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'approved_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN approved_at TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ADD COLUMN: payroll_runs.paid_at
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payroll_runs' AND column_name = 'paid_at');
SET @sql := IF(@exist = 0, 'ALTER TABLE payroll_runs ADD COLUMN paid_at TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- NEW TABLE: certifications
CREATE TABLE IF NOT EXISTS certifications (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    certification_type ENUM('electrical_safety', 'high_altitude', 'first_aid', 
                           'fire_safety', 'driving', 'solar_install', 'other') NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    certificate_number VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    document_path VARCHAR(500),
    notes TEXT,
    INDEX idx_employee (employee_id),
    INDEX idx_expiry (expiry_date)
);

-- NEW TABLE: onboarding_progress
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    task_id CHAR(36) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by CHAR(36),
    notes TEXT,
    UNIQUE KEY unique_progress (employee_id, task_id)
);
