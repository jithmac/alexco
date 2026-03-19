-- ============================================
-- ALEXCO PLATFORM - COMPLETE DATABASE SETUP
-- For Hostinger phpMyAdmin Import
-- ============================================

-- ==========================================
-- 1. PRODUCTS & INVENTORY
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_path TEXT NOT NULL,
    price_retail DECIMAL(10, 2) NOT NULL,
    price_cost DECIMAL(10, 2) DEFAULT 0,
    price_sale DECIMAL(10, 2) DEFAULT 0,
    tax_code VARCHAR(20) NOT NULL,
    description TEXT,
    long_description TEXT,
    variations JSON,
    image TEXT,
    gallery JSON,
    weight_g INT DEFAULT 0,
    specifications JSON,
    whats_included JSON,
    features JSON,
    inventory_strategy VARCHAR(20) DEFAULT 'FIFO', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku)
);

CREATE TABLE IF NOT EXISTS locations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_ledger (
    transaction_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36),
    location_id CHAR(36),
    delta INTEGER NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reference_doc VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_product_location (product_id, location_id)
);

CREATE TABLE IF NOT EXISTS delivery_rates (
    id CHAR(36) PRIMARY KEY,
    min_weight_g INT NOT NULL,
    max_weight_g INT NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. POS & SALES
-- ==========================================

CREATE TABLE IF NOT EXISTS sales_orders (
    id CHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id CHAR(36),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    delivery_method VARCHAR(20) DEFAULT 'delivery',
    location_id CHAR(36),
    cashier_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'SYNCED',
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS sales_items (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36),
    product_id CHAR(36),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==========================================
-- 3. JOB TICKETING
-- ==========================================

CREATE TABLE IF NOT EXISTS tickets (
    id CHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_serial VARCHAR(100),
    device_model VARCHAR(100),
    issue_description TEXT,
    status VARCHAR(20) NOT NULL,
    technician_id CHAR(36),
    accessories_received JSON,
    inspection_notes TEXT,
    diagnosis_notes TEXT,
    estimated_cost DECIMAL(10, 2),
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    repair_notes TEXT,
    qa_checklist JSON,
    final_cleaning_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_items (
    id CHAR(36) PRIMARY KEY,
    ticket_id CHAR(36),
    product_id CHAR(36),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS ticket_sequences (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE ticket_sequences AUTO_INCREMENT = 1001;

-- ==========================================
-- 4. HR & PAYROLL
-- ==========================================

CREATE TABLE IF NOT EXISTS employees (
    id CHAR(36) PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    name_with_initials VARCHAR(100),
    nic_number VARCHAR(15) UNIQUE,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    phone_mobile VARCHAR(20),
    phone_home VARCHAR(20),
    email VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    department ENUM('retail', 'solar', 'repair', 'admin', 'hr', 'accounts'),
    designation VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    employment_type ENUM('permanent', 'contract', 'probation', 'intern'),
    joined_date DATE,
    confirmation_date DATE,
    resignation_date DATE,
    basic_salary DECIMAL(10, 2),
    fixed_allowances DECIMAL(10, 2),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(100),
    epf_number VARCHAR(20),
    etf_number VARCHAR(20),
    user_id CHAR(36),
    pin_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nic (nic_number),
    INDEX idx_department (department),
    INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS employee_documents (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    document_type ENUM('nic_copy', 'birth_certificate', 'contract', 'offer_letter', 
                       'resignation', 'certificate', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by CHAR(36),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id)
);

CREATE TABLE IF NOT EXISTS employee_assets (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    asset_type ENUM('vehicle', 'tool', 'pos_card', 'key', 'uniform', 'laptop', 'phone', 'safety_gear', 'other') NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_code VARCHAR(50),
    description TEXT,
    assigned_date DATE NOT NULL,
    returned_date DATE,
    condition_on_issue ENUM('new', 'good', 'fair', 'poor'),
    condition_on_return ENUM('new', 'good', 'fair', 'poor', 'damaged', 'lost'),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_asset_type (asset_type)
);

CREATE TABLE IF NOT EXISTS disciplinary_records (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    record_type ENUM('verbal_warning', 'written_warning', 'final_warning', 
                     'suspension', 'termination', 'grievance', 'inquiry') NOT NULL,
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT,
    issued_by CHAR(36),
    witness_names TEXT,
    employee_response TEXT,
    outcome TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_type (record_type)
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    check_in TIMESTAMP NULL,
    check_out TIMESTAMP NULL,
    check_in_source ENUM('pos', 'mobile', 'manual', 'biometric') DEFAULT 'manual',
    check_out_source ENUM('pos', 'mobile', 'manual', 'biometric') DEFAULT 'manual',
    check_in_latitude DECIMAL(10, 8),
    check_in_longitude DECIMAL(11, 8),
    check_out_latitude DECIMAL(10, 8),
    check_out_longitude DECIMAL(11, 8),
    location_id CHAR(36),
    shift_id CHAR(36),
    ot_hours DECIMAL(5, 2) DEFAULT 0,
    ot_rate DECIMAL(3, 2) DEFAULT 1.5,
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_attendance (employee_id, date),
    INDEX idx_date (date)
);

CREATE TABLE IF NOT EXISTS shifts (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_mins INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rosters (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    location_id CHAR(36),
    shift_id CHAR(36),
    date DATE NOT NULL,
    is_day_off BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    UNIQUE KEY unique_roster (employee_id, date),
    INDEX idx_date (date)
);

CREATE TABLE IF NOT EXISTS public_holidays (
    id CHAR(36) PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    holiday_type ENUM('poya', 'national', 'special') NOT NULL,
    ot_multiplier DECIMAL(3, 2) DEFAULT 2.0,
    year INT NOT NULL,
    INDEX idx_date (date),
    INDEX idx_year (year)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    basic_earnings DECIMAL(10, 2),
    allowances DECIMAL(10, 2),
    ot_hours DECIMAL(5, 2),
    ot_pay DECIMAL(10, 2),
    commission DECIMAL(10, 2) DEFAULT 0,
    bonus DECIMAL(10, 2) DEFAULT 0,
    gross_salary DECIMAL(10, 2),
    epf_employee DECIMAL(10, 2),
    epf_employer DECIMAL(10, 2),
    etf_employer DECIMAL(10, 2),
    apit_tax DECIMAL(10, 2),
    loan_deduction DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    net_salary DECIMAL(10, 2),
    status ENUM('draft', 'approved', 'paid') DEFAULT 'draft',
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_period (period_start, period_end),
    INDEX idx_employee (employee_id)
);

-- ==========================================
-- 5. RBAC (Roles & Permissions) - MUST BE BEFORE USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    group_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id CHAR(36),
    permission_id CHAR(36),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. USER MANAGEMENT & AUTH
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM(
        'super_user', 'admin', 'manager', 'cashier',
        'technician', 'hr_staff', 'accountant',
        'ecommerce_admin', 'repair_admin'
    ) NOT NULL,
    role_id CHAR(36),
    employee_id CHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_role (role),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_user (user_id)
);

-- ==========================================
-- 7. LEAVE MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS leave_types (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    default_days_per_year DECIMAL(5, 2),
    is_paid BOOLEAN DEFAULT TRUE,
    requires_document BOOLEAN DEFAULT FALSE,
    max_consecutive_days INT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS leave_balances (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    leave_type_id CHAR(36) NOT NULL,
    year INT NOT NULL,
    entitled_days DECIMAL(5, 2),
    taken_days DECIMAL(5, 2) DEFAULT 0,
    pending_days DECIMAL(5, 2) DEFAULT 0,
    carried_forward DECIMAL(5, 2) DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    UNIQUE KEY unique_balance (employee_id, leave_type_id, year),
    INDEX idx_employee_year (employee_id, year)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    leave_type_id CHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested DECIMAL(5, 2) NOT NULL,
    is_half_day BOOLEAN DEFAULT FALSE,
    half_day_period ENUM('morning', 'afternoon'),
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    coverage_employee_id CHAR(36),
    coverage_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    INDEX idx_employee (employee_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
);

-- ==========================================
-- 8. COMMISSION & PERFORMANCE
-- ==========================================

CREATE TABLE IF NOT EXISTS commission_tiers (
    id CHAR(36) PRIMARY KEY,
    category_path VARCHAR(255),
    tier_name VARCHAR(50),
    min_sales DECIMAL(10, 2) DEFAULT 0,
    max_sales DECIMAL(10, 2),
    commission_rate DECIMAL(5, 4),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS employee_commissions (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    sales_order_id CHAR(36),
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    sales_amount DECIMAL(10, 2),
    commission_amount DECIMAL(10, 2),
    commission_tier_id CHAR(36),
    status ENUM('calculated', 'approved', 'paid') DEFAULT 'calculated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee_period (employee_id, period_year, period_month)
);

CREATE TABLE IF NOT EXISTS technician_scores (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    ticket_id CHAR(36),
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    tickets_assigned INT DEFAULT 0,
    tickets_completed INT DEFAULT 0,
    avg_resolution_hours DECIMAL(6, 2),
    first_time_fix_rate DECIMAL(5, 2),
    warranty_returns INT DEFAULT 0,
    customer_rating DECIMAL(3, 2),
    efficiency_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee_period (employee_id, period_year, period_month)
);

-- ==========================================
-- 9. EXPENSES & TRIPS
-- ==========================================

CREATE TABLE IF NOT EXISTS expense_claims (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    claim_number VARCHAR(20) UNIQUE,
    claim_date DATE NOT NULL,
    expense_type ENUM('fuel', 'transport', 'batta', 'hardware', 'meals', 'accommodation', 'other') NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_path VARCHAR(500),
    ticket_id CHAR(36),
    project_name VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS trip_allowances (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    trip_date DATE NOT NULL,
    destination VARCHAR(255),
    distance_km DECIMAL(8, 2),
    hours_on_site DECIMAL(5, 2),
    batta_amount DECIMAL(10, 2),
    transport_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    ticket_id CHAR(36),
    status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee_date (employee_id, trip_date)
);

-- ==========================================
-- 10. CERTIFICATIONS & RECRUITMENT
-- ==========================================

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
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_expiry (expiry_date)
);

CREATE TABLE IF NOT EXISTS job_vacancies (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department ENUM('retail', 'solar', 'repair', 'admin', 'hr', 'accounts') NOT NULL,
    location VARCHAR(100),
    employment_type ENUM('permanent', 'contract', 'intern'),
    description TEXT,
    requirements TEXT,
    salary_range_min DECIMAL(10, 2),
    salary_range_max DECIMAL(10, 2),
    positions_available INT DEFAULT 1,
    application_deadline DATE,
    status ENUM('draft', 'published', 'closed', 'filled') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_department (department)
);

CREATE TABLE IF NOT EXISTS job_applicants (
    id CHAR(36) PRIMARY KEY,
    vacancy_id CHAR(36) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    nic_number VARCHAR(15),
    resume_path VARCHAR(500),
    cover_letter TEXT,
    status ENUM('new', 'screening', 'interview', 'offered', 'hired', 'rejected') DEFAULT 'new',
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES job_vacancies(id),
    INDEX idx_vacancy (vacancy_id),
    INDEX idx_status (status)
);

-- ==========================================
-- 11. ONBOARDING
-- ==========================================

CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id CHAR(36) PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    department ENUM('retail', 'solar', 'repair', 'admin', 'hr', 'accounts', 'all') DEFAULT 'all',
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS onboarding_progress (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    task_id CHAR(36) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by CHAR(36),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (task_id) REFERENCES onboarding_tasks(id),
    UNIQUE KEY unique_progress (employee_id, task_id)
);

-- ==========================================
-- 12. CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id CHAR(36),
    image TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

-- ==========================================
-- 13. CONTACT MESSAGES
-- ==========================================

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

-- ==========================================
-- 14. SEED DATA
-- ==========================================

-- Default Location
INSERT IGNORE INTO locations (id, name, type) VALUES
(UUID(), 'Main Warehouse', 'Warehouse');

-- Default Leave Types
INSERT IGNORE INTO leave_types (id, name, code, default_days_per_year, is_paid, requires_document, max_consecutive_days) VALUES
('lt-annual', 'Annual Leave', 'AL', 14, TRUE, FALSE, 14),
('lt-casual', 'Casual Leave', 'CL', 7, TRUE, FALSE, 3),
('lt-medical', 'Medical Leave', 'ML', 21, TRUE, TRUE, 21),
('lt-maternity', 'Maternity Leave', 'MAT', 84, TRUE, TRUE, 84),
('lt-paternity', 'Paternity Leave', 'PAT', 3, TRUE, TRUE, 3),
('lt-nopay', 'No-Pay Leave', 'NP', 999, FALSE, FALSE, 30);

-- Default Shifts
INSERT IGNORE INTO shifts (id, name, start_time, end_time, break_duration_mins) VALUES
('shift-morning', 'Morning Shift', '08:00:00', '16:00:00', 60),
('shift-evening', 'Evening Shift', '14:00:00', '22:00:00', 60),
('shift-full', 'Full Day', '08:30:00', '17:30:00', 60),
('shift-half', 'Half Day', '08:30:00', '12:30:00', 0);

-- Default Commission Tiers
INSERT IGNORE INTO commission_tiers (id, category_path, tier_name, min_sales, max_sales, commission_rate) VALUES
('ct-solar-1', 'Solar/%', 'Solar Standard', 0, 500000, 0.005),
('ct-solar-2', 'Solar/%', 'Solar Premium', 500000, 9999999, 0.01),
('ct-electrical', 'Electrical/%', 'Electrical', 0, 9999999, 0.01),
('ct-smarthome', 'Smart Home/%', 'Smart Home', 0, 9999999, 0.02);

-- Default Onboarding Tasks
INSERT IGNORE INTO onboarding_tasks (id, task_name, description, department, order_index) VALUES
('ob-1', 'Create Email Account', 'Set up company email @alexco.lk', 'all', 1),
('ob-2', 'Issue ID Card', 'Create and issue employee ID card', 'all', 2),
('ob-3', 'Assign POS PIN', 'Generate and assign 4-digit POS PIN', 'retail', 3),
('ob-4', 'Issue Uniform', 'Issue company uniform and safety gear', 'all', 4),
('ob-5', 'System Access Setup', 'Create user account with appropriate role', 'all', 5),
('ob-6', 'Safety Training', 'Complete mandatory safety orientation', 'solar', 6),
('ob-7', 'EPF/ETF Registration', 'Submit EPF/ETF registration forms', 'all', 7),
('ob-8', 'Bank Details Collection', 'Collect and verify bank account details', 'all', 8);

-- Default Categories
INSERT IGNORE INTO categories (id, name, slug, description, order_index, icon) VALUES
('cat-solar', 'Solar & Power', 'solar', 'Solar panels, inverters, and battery systems', 1, 'Smartphone'),
('cat-electrical', 'Electrical', 'electrical', 'Wiring, switches, and protection devices', 2, 'Laptop'),
('cat-mobile', 'Mobile & Gadgets', 'mobile', 'Smartphones, tablets, and accessories', 3, 'Smartphone'),
('cat-computers', 'Computers', 'computers', 'Laptops, desktops, and components', 4, 'Laptop');

-- Category Subcategories (Solar)
INSERT IGNORE INTO categories (id, name, slug, parent_id, order_index) VALUES
('sub-solar-panels', 'Solar Panels', 'solar-panels', 'cat-solar', 1),
('sub-inverters', 'Inverters', 'inverters', 'cat-solar', 2),
('sub-batteries', 'Batteries', 'batteries', 'cat-solar', 3),
('sub-solar-access', 'Accessories', 'solar-accessories', 'cat-solar', 4);

-- Category Subcategories (Electrical)
INSERT IGNORE INTO categories (id, name, slug, parent_id, order_index) VALUES
('sub-wiring', 'Wiring & Cables', 'wiring-cables', 'cat-electrical', 1),
('sub-switches', 'Switches & Sockets', 'switches-sockets', 'cat-electrical', 2),
('sub-protection', 'Protection Devices', 'protection-devices', 'cat-electrical', 3),
('sub-lighting', 'Lighting', 'lighting', 'cat-electrical', 4);

-- ==========================================
-- 15. SEED SUPER USER (Change password after first login!)
-- Password: Admin@123 (bcrypt hash)
-- ==========================================

-- First create the Super User role
INSERT IGNORE INTO roles (id, name, slug, description, is_system) VALUES
('role-super', 'Super User', 'super_user', 'Full system access', TRUE);

-- Create all permissions
INSERT IGNORE INTO permissions (id, code, description, group_name) VALUES
('perm-admin-view', 'admin.view', 'Access admin dashboard', 'Admin'),
('perm-products-manage', 'products.manage', 'Manage products', 'Products'),
('perm-products-view', 'products.view', 'View products', 'Products'),
('perm-inventory-view', 'inventory.view', 'View inventory', 'Inventory'),
('perm-inventory-manage', 'inventory.manage', 'Manage inventory', 'Inventory'),
('perm-pos-access', 'pos.access', 'Access POS', 'POS'),
('perm-tickets-manage', 'tickets.manage', 'Manage tickets', 'Tickets'),
('perm-hr-view', 'hr.view', 'View HR', 'HR'),
('perm-hr-manage', 'hr.manage', 'Manage HR', 'HR'),
('perm-users-manage', 'users.manage', 'Manage users', 'Users'),
('perm-reports-view', 'reports.view', 'View reports', 'Reports'),
('perm-settings-manage', 'settings.manage', 'Manage settings', 'Settings'),
('perm-orders-manage', 'orders.manage', 'Manage orders', 'Orders'),
('perm-orders-view', 'orders.view', 'View orders', 'Orders'),
('perm-messages-view', 'messages.view', 'View messages', 'Messages'),
('perm-categories-manage', 'categories.manage', 'Manage categories', 'Categories');

-- Assign ALL permissions to Super User role
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role-super', 'perm-admin-view'),
('role-super', 'perm-products-manage'),
('role-super', 'perm-products-view'),
('role-super', 'perm-inventory-view'),
('role-super', 'perm-inventory-manage'),
('role-super', 'perm-pos-access'),
('role-super', 'perm-tickets-manage'),
('role-super', 'perm-hr-view'),
('role-super', 'perm-hr-manage'),
('role-super', 'perm-users-manage'),
('role-super', 'perm-reports-view'),
('role-super', 'perm-settings-manage'),
('role-super', 'perm-orders-manage'),
('role-super', 'perm-orders-view'),
('role-super', 'perm-messages-view'),
('role-super', 'perm-categories-manage');

-- Create Super Admin user
-- Username: admin  |  Password: Admin@123
INSERT IGNORE INTO users (id, username, password_hash, full_name, email, role, role_id, is_active) VALUES
('user-super-admin', 'admin', '$2b$12$TbxRl1Ouabyn11i9YXGwUeLWi8T47X6WTgOoCa2n5ScCR1LM9GdLe', 'Super Admin', 'admin@alexco.lk', 'super_user', 'role-super', TRUE);
