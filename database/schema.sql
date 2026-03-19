-- Alexco Ecosystem Database Schema (MySQL)
-- Phase 1, 2, 3, 4

-- ==========================================
-- 1. PRODUCTS & INVENTORY (Phase 1)
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY, -- Application generated UUID
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_path TEXT NOT NULL,
    price_retail DECIMAL(10, 2) NOT NULL,
    price_cost DECIMAL(10, 2) DEFAULT 0,
    price_sale DECIMAL(10, 2) DEFAULT 0,
    tax_code VARCHAR(20) NOT NULL, -- ENUM: SOLAR_EXEMPT, VAT_18
    description TEXT,
    long_description TEXT,
    variations JSON,
    image TEXT, -- Main product image URL
    gallery JSON, -- Array of additional image URLs
    weight_g INT DEFAULT 0,
    specifications JSON, -- Dynamic attributes
    whats_included JSON, -- Box contents
    features JSON, -- Key features list
    inventory_strategy VARCHAR(20) DEFAULT 'FIFO', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku)
);

CREATE TABLE IF NOT EXISTS locations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL -- Store, Warehouse, Van
);

CREATE TABLE IF NOT EXISTS inventory_ledger (
    transaction_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36),
    location_id CHAR(36),
    delta INTEGER NOT NULL, -- Negative for sales, positive for restock
    reason_code VARCHAR(50) NOT NULL, -- SALE_POS, RESTOCK, RETURN, PROJECT_ALLOCATION
    reference_doc VARCHAR(100), -- Invoice ID, PO Number, Ticket ID
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
-- 2. POS & SALES (Phase 2)
-- ==========================================

CREATE TABLE IF NOT EXISTS sales_orders (
    id CHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id CHAR(36),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- COMPLETED, REFUNDED
    payment_method VARCHAR(50) NOT NULL, -- CASH, CARD, ONLINE
    delivery_method VARCHAR(20) DEFAULT 'delivery', -- delivery, pickup
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
-- 3. JOB TICKETING (Phase 3)
-- ==========================================

CREATE TABLE IF NOT EXISTS tickets (
    id CHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- friendly ID: JOB-2026-001
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    device_serial VARCHAR(100),
    device_model VARCHAR(100),
    issue_description TEXT,
    status VARCHAR(20) NOT NULL, -- INTAKE, DIAGNOSIS, PENDING_PARTS, READY, CLOSED
    technician_id CHAR(36),
    
    -- Advanced Workflow Fields
    accessories_received JSON, -- Array of strings
    inspection_notes TEXT,
    diagnosis_notes TEXT,
    estimated_cost DECIMAL(10, 2),
    approval_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    repair_notes TEXT,
    qa_checklist JSON, -- key-value pairs of checks
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

-- ==========================================
-- 4. HR & PAYROLL - Core (Phase 4)
-- ==========================================

CREATE TABLE IF NOT EXISTS employees (
    id CHAR(36) PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE, -- EMP-001
    full_name VARCHAR(100) NOT NULL,
    name_with_initials VARCHAR(100),
    nic_number VARCHAR(15) UNIQUE, -- Sri Lankan NIC
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    
    -- Contact Info
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    phone_mobile VARCHAR(20),
    phone_home VARCHAR(20),
    email VARCHAR(100),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Employment Details
    department ENUM('retail', 'solar', 'repair', 'admin', 'hr', 'accounts'),
    designation VARCHAR(100), -- Job Title
    role VARCHAR(50) NOT NULL, -- STORE_MANAGER, CASHIER, TECHNICIAN, ADMIN
    employment_type ENUM('permanent', 'contract', 'probation', 'intern'),
    joined_date DATE,
    confirmation_date DATE,
    resignation_date DATE,
    
    -- Salary & Bank
    basic_salary DECIMAL(10, 2),
    fixed_allowances DECIMAL(10, 2),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(100),
    
    -- EPF/ETF
    epf_number VARCHAR(20),
    etf_number VARCHAR(20),
    
    -- System
    user_id CHAR(36), -- Link to users table for login
    pin_hash VARCHAR(255), -- POS PIN
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nic (nic_number),
    INDEX idx_department (department),
    INDEX idx_active (is_active)
);

-- Employee Documents (NIC copies, contracts, certificates)
CREATE TABLE IF NOT EXISTS employee_documents (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    document_type ENUM('nic_copy', 'birth_certificate', 'contract', 'offer_letter', 
                       'resignation', 'certificate', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500), -- Path to uploaded file
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by CHAR(36),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id)
);

-- Asset Custody (vehicles, tools, POS cards, keys)
CREATE TABLE IF NOT EXISTS employee_assets (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    asset_type ENUM('vehicle', 'tool', 'pos_card', 'key', 'uniform', 'laptop', 'phone', 'safety_gear', 'other') NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    asset_code VARCHAR(50), -- Asset tag/serial
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

-- Disciplinary & Grievance Records
CREATE TABLE IF NOT EXISTS disciplinary_records (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    record_type ENUM('verbal_warning', 'written_warning', 'final_warning', 
                     'suspension', 'termination', 'grievance', 'inquiry') NOT NULL,
    incident_date DATE NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT,
    issued_by CHAR(36), -- User who issued
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

-- Attendance Logs (extended with GPS and source)
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
    location_id CHAR(36), -- Which branch/site
    shift_id CHAR(36),
    ot_hours DECIMAL(5, 2) DEFAULT 0,
    ot_rate DECIMAL(3, 2) DEFAULT 1.5, -- 1.5x normal, 2.0x for Poya
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_attendance (employee_id, date),
    INDEX idx_date (date)
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Morning, Evening, Night
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_mins INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE
);

-- Rosters (Employee to Shift assignments)
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

-- Sri Lankan Public Holidays (for OT calculation)
CREATE TABLE IF NOT EXISTS public_holidays (
    id CHAR(36) PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    holiday_type ENUM('poya', 'national', 'special') NOT NULL,
    ot_multiplier DECIMAL(3, 2) DEFAULT 2.0, -- 2x for Poya/Sunday
    year INT NOT NULL,
    INDEX idx_date (date),
    INDEX idx_year (year)
);

-- Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Earnings
    basic_earnings DECIMAL(10, 2),
    allowances DECIMAL(10, 2),
    ot_hours DECIMAL(5, 2),
    ot_pay DECIMAL(10, 2),
    commission DECIMAL(10, 2) DEFAULT 0,
    bonus DECIMAL(10, 2) DEFAULT 0,
    gross_salary DECIMAL(10, 2),
    
    -- Deductions
    epf_employee DECIMAL(10, 2), -- 8%
    epf_employer DECIMAL(10, 2), -- 12%
    etf_employer DECIMAL(10, 2), -- 3%
    apit_tax DECIMAL(10, 2), -- PAYE
    loan_deduction DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    
    -- Net
    net_salary DECIMAL(10, 2),
    
    -- Status
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
-- 5. USER MANAGEMENT & AUTH (Phase 5)
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM(
        'super_user',
        'admin',
        'manager',
        'cashier',
        'technician',
        'hr_staff',
        'accountant',
        'ecommerce_admin',
        'repair_admin'
    ) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36),
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_role (role)
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
-- 6. COMPLETE HR SYSTEM (Phase 6)
-- ==========================================

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Annual, Casual, Medical, Maternity, etc.
    code VARCHAR(10) NOT NULL UNIQUE,
    default_days_per_year DECIMAL(5, 2),
    is_paid BOOLEAN DEFAULT TRUE,
    requires_document BOOLEAN DEFAULT FALSE, -- e.g., Medical needs doctor's note
    max_consecutive_days INT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Leave Balances (per employee per year)
CREATE TABLE IF NOT EXISTS leave_balances (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    leave_type_id CHAR(36) NOT NULL,
    year INT NOT NULL,
    entitled_days DECIMAL(5, 2), -- May be prorated
    taken_days DECIMAL(5, 2) DEFAULT 0,
    pending_days DECIMAL(5, 2) DEFAULT 0, -- Awaiting approval
    carried_forward DECIMAL(5, 2) DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    UNIQUE KEY unique_balance (employee_id, leave_type_id, year),
    INDEX idx_employee_year (employee_id, year)
);

-- Leave Requests
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
    
    -- Approval
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    
    -- Coverage
    coverage_employee_id CHAR(36), -- Who covers the shift
    coverage_confirmed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    INDEX idx_employee (employee_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
);

-- Commission Tiers (for retail staff)
CREATE TABLE IF NOT EXISTS commission_tiers (
    id CHAR(36) PRIMARY KEY,
    category_path VARCHAR(255), -- Product category
    tier_name VARCHAR(50),
    min_sales DECIMAL(10, 2) DEFAULT 0,
    max_sales DECIMAL(10, 2),
    commission_rate DECIMAL(5, 4), -- e.g., 0.01 = 1%
    is_active BOOLEAN DEFAULT TRUE
);

-- Employee Commission Records
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

-- Technician Performance Scores
CREATE TABLE IF NOT EXISTS technician_scores (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    ticket_id CHAR(36),
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    
    -- Metrics
    tickets_assigned INT DEFAULT 0,
    tickets_completed INT DEFAULT 0,
    avg_resolution_hours DECIMAL(6, 2),
    first_time_fix_rate DECIMAL(5, 2), -- Percentage
    warranty_returns INT DEFAULT 0, -- Negative indicator
    customer_rating DECIMAL(3, 2), -- 1-5 scale
    
    efficiency_score DECIMAL(5, 2), -- Calculated overall score
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee_period (employee_id, period_year, period_month)
);

-- Expense Claims
CREATE TABLE IF NOT EXISTS expense_claims (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    claim_number VARCHAR(20) UNIQUE, -- EXP-2026-001
    claim_date DATE NOT NULL,
    expense_type ENUM('fuel', 'transport', 'batta', 'hardware', 'meals', 'accommodation', 'other') NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_path VARCHAR(500), -- Uploaded receipt image
    
    -- Related to project/ticket
    ticket_id CHAR(36),
    project_name VARCHAR(255),
    
    -- Approval
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

-- Trip/Batta Allowances
CREATE TABLE IF NOT EXISTS trip_allowances (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    trip_date DATE NOT NULL,
    destination VARCHAR(255),
    distance_km DECIMAL(8, 2),
    hours_on_site DECIMAL(5, 2),
    
    -- Calculated allowances
    batta_amount DECIMAL(10, 2), -- Subsistence
    transport_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    
    ticket_id CHAR(36), -- Related job ticket
    status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee_date (employee_id, trip_date)
);

-- Safety Certifications
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
    -- is_expired should be checked at query time: expiry_date < CURDATE()
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_expiry (expiry_date)
);

-- Job Vacancies (Recruitment)
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

-- Job Applicants
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

-- Onboarding Tasks
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id CHAR(36) PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    department ENUM('retail', 'solar', 'repair', 'admin', 'hr', 'accounts', 'all') DEFAULT 'all',
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Onboarding Progress (per new hire)
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
-- 7. SEED DATA
-- ==========================================

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

-- ==========================================
-- 8. RBAC (Dynamic Roles)
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

-- Note: users table updated via migration to include role_id FK

-- ==========================================
-- 9. CONTACT MESSAGES
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
