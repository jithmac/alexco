-- Alexco Database Full Dump
-- Generated: 2026-02-11T11:44:57.404Z
-- Database: undefined

SET FOREIGN_KEY_CHECKS=0;

-- Table structure for table `attendance_logs`
DROP TABLE IF EXISTS `attendance_logs`;
CREATE TABLE `attendance_logs` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) DEFAULT NULL,
  `check_in` timestamp NULL DEFAULT NULL,
  `check_out` timestamp NULL DEFAULT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `attendance_logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `attendance_logs`

-- Table structure for table `categories`
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `categories`
INSERT INTO `categories` VALUES 
('87a7e538-2916-4c73-a2c1-9aea7fda1afb', 'Android', 'android', 'Android Devices', 'cat-mobile', NULL, NULL, 1, 0, '2026-02-07 12:13:38.000', '2026-02-07 12:13:38.000'),
('cat-computers', 'Computers', 'computers', 'Laptops, desktops, and components', NULL, NULL, 'Laptop', 1, 4, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('cat-electrical', 'Electrical', 'electrical', 'Wiring, switches, and protection devices', NULL, NULL, 'Laptop', 1, 2, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('cat-mobile', 'Mobile & Gadgets', 'mobile', 'Smartphones, tablets, and accessories', NULL, NULL, 'Smartphone', 1, 3, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('cat-solar', 'Solar & Power', 'solar', 'Solar panels, inverters, and battery systems', NULL, '/uploads/products/1770734037647-997000362-1_(4).jpeg', 'Smartphone', 1, 1, '2026-02-07 12:02:55.000', '2026-02-11 14:42:34.000'),
('sub-batteries', 'Batteries', 'batteries', NULL, 'cat-solar', NULL, NULL, 1, 3, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('sub-inverters', 'Inverters', 'inverters', NULL, 'cat-solar', NULL, NULL, 1, 2, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('sub-lighting', 'Lighting', 'lighting', NULL, 'cat-electrical', NULL, NULL, 1, 4, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('sub-protection', 'Protection Devices', 'protection-devices', NULL, 'cat-electrical', NULL, NULL, 1, 3, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('sub-solar-access', 'Solar Accessories', 'solar-accessories', NULL, 'cat-solar', NULL, NULL, 1, 4, '2026-02-07 12:02:55.000', '2026-02-11 14:31:13.000'),
('sub-solar-panels', 'Solar Panels', 'solar-panels', NULL, 'cat-solar', NULL, NULL, 1, 1, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('sub-switches', 'Switches & Sockets', 'switches-sockets', NULL, 'cat-electrical', NULL, NULL, 1, 2, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000'),
('sub-wiring', 'Wiring & Cables', 'wiring-cables', NULL, 'cat-electrical', NULL, NULL, 1, 1, '2026-02-07 12:02:55.000', '2026-02-07 12:02:55.000');

-- Table structure for table `commission_tiers`
DROP TABLE IF EXISTS `commission_tiers`;
CREATE TABLE `commission_tiers` (
  `id` char(36) NOT NULL,
  `category_path` varchar(255) DEFAULT NULL,
  `tier_name` varchar(50) DEFAULT NULL,
  `min_sales` decimal(10,2) DEFAULT 0.00,
  `max_sales` decimal(10,2) DEFAULT NULL,
  `commission_rate` decimal(5,4) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `commission_tiers`

-- Table structure for table `contact_messages`
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` char(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied','archived') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `contact_messages`

-- Table structure for table `delivery_rates`
DROP TABLE IF EXISTS `delivery_rates`;
CREATE TABLE `delivery_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `min_weight_g` int(11) NOT NULL,
  `max_weight_g` int(11) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1628 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `delivery_rates`
INSERT INTO `delivery_rates` VALUES 
(33, 10001, 999999, '2500.00', '2026-02-02 19:03:49.000'),
(46, 0, 1000, '350.00', '2026-02-02 19:03:49.000'),
(1626, 1001, 5000, '750.00', '2026-02-02 19:03:49.000'),
(1627, 5001, 10000, '1500.00', '2026-02-02 19:03:49.000');

-- Table structure for table `disciplinary_records`
DROP TABLE IF EXISTS `disciplinary_records`;
CREATE TABLE `disciplinary_records` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `record_type` enum('verbal_warning','written_warning','final_warning','suspension','termination','grievance','inquiry') NOT NULL,
  `incident_date` date NOT NULL,
  `description` text NOT NULL,
  `action_taken` text DEFAULT NULL,
  `issued_by` char(36) DEFAULT NULL,
  `witness_names` text DEFAULT NULL,
  `employee_response` text DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `is_resolved` tinyint(1) DEFAULT 0,
  `resolution_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_type` (`record_type`),
  CONSTRAINT `disciplinary_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `disciplinary_records`

-- Table structure for table `employee_assets`
DROP TABLE IF EXISTS `employee_assets`;
CREATE TABLE `employee_assets` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `asset_type` enum('vehicle','tool','pos_card','key','uniform','laptop','phone','safety_gear','other') NOT NULL,
  `asset_name` varchar(255) NOT NULL,
  `asset_code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `assigned_date` date NOT NULL,
  `returned_date` date DEFAULT NULL,
  `condition_on_issue` enum('new','good','fair','poor') DEFAULT NULL,
  `condition_on_return` enum('new','good','fair','poor','damaged','lost') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_asset_type` (`asset_type`),
  CONSTRAINT `employee_assets_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `employee_assets`
INSERT INTO `employee_assets` VALUES 
('be206b26-2f4a-4454-8564-0c7eccdd1b91', '550581cf-02d7-426f-ae1a-ab2e86500555', 'laptop', 'hgh', '878787', NULL, '2026-02-10 00:00:00.000', NULL, 'new', NULL, 'iuiuuiui');

-- Table structure for table `employee_commissions`
DROP TABLE IF EXISTS `employee_commissions`;
CREATE TABLE `employee_commissions` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `sales_order_id` char(36) DEFAULT NULL,
  `period_month` int(11) NOT NULL,
  `period_year` int(11) NOT NULL,
  `sales_amount` decimal(10,2) DEFAULT NULL,
  `commission_amount` decimal(10,2) DEFAULT NULL,
  `commission_tier_id` char(36) DEFAULT NULL,
  `status` enum('calculated','approved','paid') DEFAULT 'calculated',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_employee_period` (`employee_id`,`period_year`,`period_month`),
  CONSTRAINT `employee_commissions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `employee_commissions`

-- Table structure for table `employee_documents`
DROP TABLE IF EXISTS `employee_documents`;
CREATE TABLE `employee_documents` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `document_type` enum('nic_copy','birth_certificate','contract','offer_letter','resignation','certificate','other') NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `uploaded_by` char(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `employee_documents`

-- Table structure for table `employees`
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` char(36) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `pin_hash` varchar(255) DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `fixed_allowances` decimal(10,2) DEFAULT NULL,
  `joined_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `employee_number` varchar(20) DEFAULT NULL,
  `name_with_initials` varchar(100) DEFAULT NULL,
  `nic_number` varchar(15) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `phone_mobile` varchar(20) DEFAULT NULL,
  `phone_home` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `department` enum('retail','solar','repair','admin','hr','accounts') DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `employment_type` enum('permanent','contract','probation','intern') DEFAULT NULL,
  `confirmation_date` date DEFAULT NULL,
  `resignation_date` date DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_branch` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_account_name` varchar(100) DEFAULT NULL,
  `epf_number` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive','terminated','resigned') DEFAULT 'active',
  `etf_number` varchar(50) DEFAULT NULL,
  `epf_employee_rate` decimal(5,4) DEFAULT 0.0800,
  `epf_employer_rate` decimal(5,4) DEFAULT 0.1200,
  `etf_employer_rate` decimal(5,4) DEFAULT 0.0300,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_number` (`employee_number`),
  UNIQUE KEY `nic_number` (`nic_number`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `employees`
INSERT INTO `employees` VALUES 
('550581cf-02d7-426f-ae1a-ab2e86500555', 'Janith', 'CASHIER', NULL, NULL, '200000.00', '0.00', '2026-01-30 00:00:00.000', 1, 'EMP-0007', NULL, '888888', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '+94764522262', NULL, 'bsprk1@gmail.com', NULL, NULL, NULL, 'solar', 'Developer', 'permanent', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('dc4eda11-780e-4bd9-becd-35560ceebf57', 'Janith Weerasingha 2', 'ADMIN', NULL, NULL, '3333333.00', '0.00', '2026-02-10 00:00:00.000', 1, 'EMP-0009', NULL, 'ad45454', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '+94764522262', NULL, 'bsprk1@gmail.com', NULL, NULL, NULL, 'solar', 'Developer', 'permanent', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('e8301196-ce30-4a1a-ae90-fc387a181952', 'Janith Weerasingha', 'custom1', '5e052d76-daaa-4a79-b912-a52c116d0e9e', NULL, '3333333.00', '0.00', '2026-02-10 00:00:00.000', 1, 'EMP-0008', NULL, 'ad4545', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '+94764522262', NULL, 'bsprk1@gmail.com', NULL, NULL, NULL, 'solar', 'Developer', 'permanent', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('emp-kamal-tech', 'Kamal Perera', 'technician', NULL, NULL, NULL, NULL, '2023-01-15 00:00:00.000', 1, 'EMP-101', NULL, NULL, NULL, NULL, NULL, '123 Mock Street', NULL, NULL, NULL, NULL, '0771234567', NULL, 'kamal.tech@alexco.lk', NULL, NULL, NULL, 'solar', 'Senior Technician', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('emp-nimali-pos', 'Nimali Fernando', 'cashier', NULL, NULL, NULL, NULL, '2023-01-15 00:00:00.000', 1, 'EMP-102', NULL, NULL, NULL, NULL, NULL, '123 Mock Street', NULL, NULL, NULL, NULL, '0771234567', NULL, 'nimali.pos@alexco.lk', NULL, NULL, NULL, 'retail', 'Sales Assistant', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('emp-sarah-hr', 'Sarah Silva', 'hr_staff', NULL, NULL, NULL, NULL, '2023-01-15 00:00:00.000', 1, 'EMP-100', NULL, NULL, NULL, NULL, NULL, '123 Mock Street', NULL, NULL, NULL, NULL, '0771234567', NULL, 'sarah.hr@alexco.lk', NULL, NULL, NULL, 'hr', 'HR Manager', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('test-id-1', 'Test User', '', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'test@example.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('test-id-2', 'Test User 2', '', NULL, NULL, NULL, NULL, NULL, 1, 'EMP-TEST', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300'),
('test-id-full', 'Test Full', 'manager', NULL, NULL, NULL, NULL, '2023-01-15 00:00:00.000', 1, 'EMP-FULL', NULL, NULL, NULL, NULL, NULL, '123 Mock Street', NULL, NULL, NULL, NULL, '0771234567', NULL, 'test@test.com', NULL, NULL, NULL, 'hr', 'Manager', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '0.0800', '0.1200', '0.0300');

-- Table structure for table `expense_claims`
DROP TABLE IF EXISTS `expense_claims`;
CREATE TABLE `expense_claims` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `claim_number` varchar(20) DEFAULT NULL,
  `claim_date` date NOT NULL,
  `expense_type` enum('fuel','transport','batta','hardware','meals','accommodation','other') NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `receipt_path` varchar(500) DEFAULT NULL,
  `ticket_id` char(36) DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','paid') DEFAULT 'pending',
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `claim_number` (`claim_number`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `expense_claims_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `expense_claims`

-- Table structure for table `inventory_ledger`
DROP TABLE IF EXISTS `inventory_ledger`;
CREATE TABLE `inventory_ledger` (
  `transaction_id` char(36) NOT NULL,
  `product_id` char(36) DEFAULT NULL,
  `variant_id` varchar(255) DEFAULT NULL,
  `location_id` char(36) DEFAULT NULL,
  `delta` int(11) NOT NULL,
  `reason_code` varchar(50) NOT NULL,
  `reference_doc` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`transaction_id`),
  KEY `location_id` (`location_id`),
  KEY `idx_product_location` (`product_id`,`location_id`),
  CONSTRAINT `inventory_ledger_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `inventory_ledger_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `inventory_ledger`
INSERT INTO `inventory_ledger` VALUES 
('053a137f-040b-4413-be70-2cf742ff00a6', '15c15df8-e8c8-42ee-84f9-4b43581bd222', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -2, 'SALE_ONLINE', 'ONL-705727', '2026-02-02 15:51:45.000'),
('0caa704d-055c-4cf3-bf55-f763535c990b', 'f42252b1-7fd3-45c2-bad8-b15d85eaa20b', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 50, 'RESTOCK', NULL, '2026-01-29 09:47:12.000'),
('0cc3974f-21ec-415d-8c7f-545f25b71f52', '5b1b2ea3-0b4a-4e6e-982d-b2a62f5e473e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 11, 'INITIAL_STOCK', 'SETUP', '2026-02-07 11:43:22.000'),
('0d5d8ec4-b11c-4936-a280-95601f1bd5c2', '278266f1-7154-441d-82aa-cc9614ca774e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-770675', '2026-02-02 10:36:10.000'),
('149cb794-c2a7-4463-8944-fb9b4d041173', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:blue; Length:5', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -45, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:42:05.000'),
('1c564164-78a1-4b3c-8760-4634b655e2e6', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:blue; Length:5', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 45, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:39:20.000'),
('1f43072c-eaf5-4156-aff5-06f200d93fb4', '05acb67e-859c-47fe-8d1c-237470836a38', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -5, 'SALE_ONLINE', 'ONL-705727', '2026-02-02 15:51:45.000'),
('221413a9-c5b1-4f3f-98cf-c92993bbbe03', '15c15df8-e8c8-42ee-84f9-4b43581bd222', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -2, 'SALE_POS', 'ORD-910701', '2026-02-02 10:38:30.000'),
('2267b404-2c84-4549-8019-a6f32f6b5230', '8fbf6376-8569-45fc-8bd5-c0a6b09d41cc', 'color:red; Length:8', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 3, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:42:47.000'),
('24ac5359-2d62-4c24-9eb0-d32b2a292ad0', '7d16150d-7397-4489-9fa2-4956bb0df5dd', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-072201', '2026-02-02 10:41:12.000'),
('280ffa93-bfe6-407a-bb91-a8ff20a6beeb', '5b1b2ea3-0b4a-4e6e-982d-b2a62f5e473e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-316734', '2026-02-07 21:51:56.000'),
('2bcf06d1-babb-44dd-a04a-e5c737259def', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-683174', '2026-02-02 20:01:23.000'),
('3239f066-9923-41ee-96eb-6ea58d1f412d', '4665a19b-afba-45f0-9232-28ba09e252b7', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-176207', '2026-02-02 10:42:56.000'),
('3340fae0-f67e-4553-96e9-37d96e3d5727', '278266f1-7154-441d-82aa-cc9614ca774e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_ONLINE', 'ONL-124577', '2026-02-02 16:15:24.000'),
('347cd3ed-a7e7-4e97-b1d5-5ced08e36c65', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 20, 'INITIAL_STOCK', 'SETUP', '2026-01-30 21:30:36.000'),
('3af894f2-b89c-467a-a56b-e96d6bf4e473', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:red; Length:2', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 5, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:39:07.000'),
('45ee73bb-6723-4cc1-8f4f-248c67f6b69e', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:green; Length:5', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 2, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:39:34.000'),
('52b6d1b7-4099-4ddd-9427-7402eb421baa', '3b377154-0e95-4eb5-988c-8705c589fab0', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-910701', '2026-02-02 10:38:30.000'),
('5b5f3152-d9ec-4a61-a541-45d90c7455e7', '15c15df8-e8c8-42ee-84f9-4b43581bd222', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-285210', '2026-02-02 09:04:45.000'),
('6205df75-c135-41b7-8406-ea649c022e74', '94ba0cd8-dc8f-4663-9aa1-18b5f0c073fc', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 50, 'RESTOCK', NULL, '2026-01-29 09:47:12.000'),
('7001ed28-ece4-48b9-bf11-7f919957929e', '4665a19b-afba-45f0-9232-28ba09e252b7', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-770675', '2026-02-02 10:36:10.000'),
('72797139-379a-4a63-8fb6-b307f1e33a69', '3b377154-0e95-4eb5-988c-8705c589fab0', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-285210', '2026-02-02 09:04:45.000'),
('72c5c212-82a1-4346-8f4f-6a880e40196b', '5cb09ae1-dfd1-4734-9f42-2866779927f6', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-411619', '2026-02-02 15:13:31.000'),
('7aa6bb8b-d521-495d-9dfb-61de3286579a', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 100, 'RESTOCK', 'ADMIN_ADJ', '2026-02-02 18:34:45.000'),
('7f327694-813d-4c20-9ac4-a4d45e3389ba', '278266f1-7154-441d-82aa-cc9614ca774e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-159886', '2026-02-02 10:42:39.000'),
('7f61224c-96d2-4ec4-a756-8e549bbad0c9', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:red; Length:5', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 7, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:39:10.000'),
('80b7ab4b-2dca-480b-8089-6fe4c56459d4', '05acb67e-859c-47fe-8d1c-237470836a38', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_ONLINE', 'ONL-124577', '2026-02-02 16:15:24.000'),
('8127df0e-d6a9-47dc-a57a-c498ef9b8d9b', '5cb09ae1-dfd1-4734-9f42-2866779927f6', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 50, 'RESTOCK', NULL, '2026-01-29 09:47:12.000'),
('83ef1e40-12ae-441a-9653-f7b5d3d0578d', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:red; Length:4', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 6, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:39:08.000'),
('8dab83c4-7672-47be-86e0-7678a2edcdd3', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-316734', '2026-02-07 21:51:56.000'),
('9712fecf-ae4e-456e-89eb-95915c33032b', '8fbf6376-8569-45fc-8bd5-c0a6b09d41cc', 'color:red; Length:5', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 2, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:42:46.000'),
('9a6c6b18-82cf-420e-aefa-9baff47cc811', '38f54d02-9b4c-4ebd-ae29-d9eb62bd269c', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-072201', '2026-02-02 10:41:12.000'),
('9f936157-60af-41bb-b8e6-2f64fc8ef589', '8fbf6376-8569-45fc-8bd5-c0a6b09d41cc', 'color:red; Length:4', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 1, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:42:45.000'),
('b0b02966-42c5-4447-98ea-9d2f43d06400', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-411619', '2026-02-02 15:13:31.000'),
('b3ad58ea-eaba-48d2-af7f-120d75fd0284', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'color:red; Length:8', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 8, 'VAR_ADJ', 'ADMIN_ADJ', '2026-02-10 18:39:11.000'),
('bcd18331-bcf3-4379-8643-e0cf0ea9ad85', '278266f1-7154-441d-82aa-cc9614ca774e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 10, 'RESTOCK', 'ADMIN_ADJ', '2026-02-02 19:55:24.000'),
('bf8084f7-e46a-4ab0-9c57-a449e3ce7228', '278266f1-7154-441d-82aa-cc9614ca774e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-316734', '2026-02-07 21:51:56.000'),
('c23b34a4-cc31-440f-a40e-caa202a66f9a', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -2, 'SALE_ONLINE', 'ONL-314070', '2026-02-07 14:21:54.000'),
('c5c96be8-3149-4ed4-b766-fbd5cc6493f4', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-683174', '2026-02-02 20:01:23.000'),
('e2aa8c13-451b-4454-af23-439aacd308db', '278266f1-7154-441d-82aa-cc9614ca774e', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-683174', '2026-02-02 20:01:23.000'),
('e45b5c3d-09fa-4504-b950-1ccfbe0ac7d4', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 'Test:Variant', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 5, 'DEBUG_ADD', 'TEST_DEBUG', '2026-02-10 18:13:20.000'),
('f8507d4f-9ee1-4671-a7cb-37b444502918', '5cb09ae1-dfd1-4734-9f42-2866779927f6', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', -1, 'SALE_POS', 'ORD-910701', '2026-02-02 10:38:30.000'),
('fa94da74-7800-4461-a73c-3d0a46361237', 'e54158de-a53a-4b08-8025-9342db9ff138', NULL, 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', 1, 'RESTOCK', 'ADMIN_ADJ', '2026-02-07 15:44:51.000');

-- Table structure for table `job_applicants`
DROP TABLE IF EXISTS `job_applicants`;
CREATE TABLE `job_applicants` (
  `id` char(36) NOT NULL,
  `vacancy_id` char(36) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `nic_number` varchar(15) DEFAULT NULL,
  `resume_path` varchar(500) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `status` enum('new','screening','interview','offered','hired','rejected') DEFAULT 'new',
  `notes` text DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_vacancy` (`vacancy_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `job_applicants_ibfk_1` FOREIGN KEY (`vacancy_id`) REFERENCES `job_vacancies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `job_applicants`

-- Table structure for table `job_vacancies`
DROP TABLE IF EXISTS `job_vacancies`;
CREATE TABLE `job_vacancies` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `department` enum('retail','solar','repair','admin','hr','accounts') NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `employment_type` enum('permanent','contract','intern') DEFAULT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `salary_range_min` decimal(10,2) DEFAULT NULL,
  `salary_range_max` decimal(10,2) DEFAULT NULL,
  `positions_available` int(11) DEFAULT 1,
  `application_deadline` date DEFAULT NULL,
  `status` enum('draft','published','closed','filled') DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `job_vacancies`

-- Table structure for table `leave_balances`
DROP TABLE IF EXISTS `leave_balances`;
CREATE TABLE `leave_balances` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `leave_type_id` char(36) NOT NULL,
  `year` int(11) NOT NULL,
  `entitled_days` decimal(5,2) DEFAULT NULL,
  `taken_days` decimal(5,2) DEFAULT 0.00,
  `pending_days` decimal(5,2) DEFAULT 0.00,
  `carried_forward` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_balance` (`employee_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `idx_employee_year` (`employee_id`,`year`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `leave_balances`
INSERT INTO `leave_balances` VALUES 
('d0005d0b-fcfc-11f0-b52b-0468747638d6', 'emp-sarah-hr', '734a3039-408a-4b93-b526-40db024b89fb', 2025, '14.00', '0.00', '0.00', '0.00'),
('d002db71-fcfc-11f0-b52b-0468747638d6', 'emp-sarah-hr', 'ec367de9-b7cd-4a6e-86d8-f0b39361dbce', 2025, '14.00', '0.00', '0.00', '0.00'),
('d004b46d-fcfc-11f0-b52b-0468747638d6', 'emp-sarah-hr', 'a2f5f68d-1c85-41a6-affd-7a2e0e81a978', 2025, '14.00', '0.00', '0.00', '0.00'),
('d0079503-fcfc-11f0-b52b-0468747638d6', 'emp-kamal-tech', '734a3039-408a-4b93-b526-40db024b89fb', 2025, '14.00', '0.00', '0.00', '0.00'),
('d0082f1f-fcfc-11f0-b52b-0468747638d6', 'emp-kamal-tech', 'ec367de9-b7cd-4a6e-86d8-f0b39361dbce', 2025, '14.00', '3.00', '0.00', '0.00'),
('d0091767-fcfc-11f0-b52b-0468747638d6', 'emp-kamal-tech', 'a2f5f68d-1c85-41a6-affd-7a2e0e81a978', 2025, '14.00', '0.00', '0.00', '0.00'),
('d00b2719-fcfc-11f0-b52b-0468747638d6', 'emp-nimali-pos', '734a3039-408a-4b93-b526-40db024b89fb', 2025, '14.00', '0.00', '0.00', '0.00'),
('d00d1707-fcfc-11f0-b52b-0468747638d6', 'emp-nimali-pos', 'ec367de9-b7cd-4a6e-86d8-f0b39361dbce', 2025, '14.00', '0.00', '0.00', '0.00'),
('d00d7fd8-fcfc-11f0-b52b-0468747638d6', 'emp-nimali-pos', 'a2f5f68d-1c85-41a6-affd-7a2e0e81a978', 2025, '14.00', '0.00', '0.00', '0.00'),
('f68e2e48-0593-11f1-9154-0468747638d6', '550581cf-02d7-426f-ae1a-ab2e86500555', '734a3039-408a-4b93-b526-40db024b89fb', 2026, '14.00', '2.00', '0.00', '0.00');

-- Table structure for table `leave_requests`
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `leave_type_id` char(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_requested` decimal(5,2) NOT NULL,
  `is_half_day` tinyint(1) DEFAULT 0,
  `half_day_period` enum('morning','afternoon') DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` char(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `coverage_employee_id` char(36) DEFAULT NULL,
  `coverage_confirmed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `leave_requests`
INSERT INTO `leave_requests` VALUES 
('d00f5d10-fcfc-11f0-b52b-0468747638d6', 'emp-kamal-tech', 'ec367de9-b7cd-4a6e-86d8-f0b39361dbce', '2025-02-10 00:00:00.000', '2025-02-12 00:00:00.000', '3.00', 0, NULL, 'Personal Trip for Seeding', 'approved', '30fc04d1-6d02-49dd-93cc-950a938a6006', '2026-02-02 14:39:25.000', NULL, NULL, 0, '2026-01-29 15:55:16.000'),
('dce2a0d2-fdc1-4a36-a4a0-dda00b7cb1b6', '550581cf-02d7-426f-ae1a-ab2e86500555', '734a3039-408a-4b93-b526-40db024b89fb', '2026-02-10 00:00:00.000', '2026-02-11 00:00:00.000', '2.00', 0, NULL, 'test', 'approved', '30fc04d1-6d02-49dd-93cc-950a938a6006', '2026-02-09 14:17:08.000', NULL, NULL, 0, '2026-02-09 14:10:38.000');

-- Table structure for table `leave_types`
DROP TABLE IF EXISTS `leave_types`;
CREATE TABLE `leave_types` (
  `id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `default_days_per_year` decimal(5,2) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 1,
  `requires_document` tinyint(1) DEFAULT 0,
  `max_consecutive_days` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `leave_types`
INSERT INTO `leave_types` VALUES 
('734a3039-408a-4b93-b526-40db024b89fb', 'Annual', 'ANN', NULL, 1, 0, NULL, 1),
('a2f5f68d-1c85-41a6-affd-7a2e0e81a978', 'Medical', 'MED', NULL, 1, 0, NULL, 1),
('ec367de9-b7cd-4a6e-86d8-f0b39361dbce', 'Casual', 'CAS', NULL, 1, 0, NULL, 1);

-- Table structure for table `locations`
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `locations`
INSERT INTO `locations` VALUES 
('d1c1cfd5-eec0-4d72-8961-04b0d154ef59', 'Main Store', 'Store');

-- Table structure for table `onboarding_tasks`
DROP TABLE IF EXISTS `onboarding_tasks`;
CREATE TABLE `onboarding_tasks` (
  `id` char(36) NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `department` enum('retail','solar','repair','admin','hr','accounts','all') DEFAULT 'all',
  `order_index` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `onboarding_tasks`

-- Table structure for table `payroll_runs`
DROP TABLE IF EXISTS `payroll_runs`;
CREATE TABLE `payroll_runs` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) DEFAULT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `basic_earnings` decimal(10,2) DEFAULT NULL,
  `allowances` decimal(10,2) DEFAULT NULL,
  `ot_hours` decimal(5,2) DEFAULT NULL,
  `ot_pay` decimal(10,2) DEFAULT NULL,
  `epf_employee` decimal(10,2) DEFAULT NULL,
  `epf_employer` decimal(10,2) DEFAULT NULL,
  `etf_employer` decimal(10,2) DEFAULT NULL,
  `paye_tax` decimal(10,2) DEFAULT NULL,
  `net_salary` decimal(10,2) DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `payroll_runs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `payroll_runs`

-- Table structure for table `permissions`
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` char(36) NOT NULL,
  `code` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `permissions`
INSERT INTO `permissions` VALUES 
('0400d459-bd2e-4fe4-bba9-f47bffa167fe', 'payroll.view', 'View monthly payroll summary and stats', 'HR', '2026-02-09 07:32:47.000'),
('053b965f-7252-4a8a-ae1a-1c51475f12c2', 'admin.manage', 'Full Admin Access', 'Admin', '2026-02-06 16:10:24.000'),
('125e380c-43c3-4c13-ab30-d0d684098d46', 'users.manage', 'Manage Users & Roles', 'System', '2026-02-06 16:10:24.000'),
('157dd05a-75ba-4c2e-a4f3-0afc4e193343', 'inventory.manage', 'Manage Inventory (Add/Edit/Audits)', 'Inventory', '2026-02-06 16:10:24.000'),
('1b3644a5-2df5-4e8f-ba37-be9117329962', 'reports.view', 'Access to the Reports Hub dashboard', 'Admin', '2026-02-09 07:32:47.000'),
('22ebce3e-ad52-4bfb-a292-e29357ca14df', 'admin.view', 'View Admin Dashboard', 'Admin', '2026-02-06 16:10:24.000'),
('4e2e5f0d-da92-4017-a4e1-39f8d6892e5d', 'ecommerce.manage', 'Manage Online Orders', 'E-commerce', '2026-02-06 16:10:24.000'),
('55f9ab20-0a47-4e39-bd46-7e11d022c425', 'admin.settings', 'Access to system and delivery configuration', 'Admin', '2026-02-09 07:32:47.000'),
('620f7165-5548-4951-9e7b-3daa1e2da885', 'pos.access', 'Access POS Terminal', 'POS', '2026-02-06 16:10:24.000'),
('649e93ad-dccc-4d8a-b091-c14f4be203e3', 'inventory.view', 'View Inventory', 'Inventory', '2026-02-06 16:10:24.000'),
('71926c9a-8a88-4d75-a1f2-5211eac90f19', 'hr.view', 'View HR Dashboard', 'HR', '2026-02-06 16:10:24.000'),
('94065acd-37bc-435d-9cec-2b4cb775c173', 'inventory.categories', 'Add, edit, or delete inventory categories', 'Inventory', '2026-02-09 07:32:47.000'),
('b2747eed-5be6-4ab3-aad7-7f1a748f3dad', 'payroll.manage', 'Generate and download payroll reports and bank files', 'HR', '2026-02-09 07:32:47.000'),
('ba3f97cf-046d-4329-90e5-dc251f1c709e', 'pos.reports', 'Access to POS-specific sales reports and analytics', 'POS', '2026-02-09 07:32:47.000'),
('categories.manage', '', 'Manage categories', NULL, '2026-02-10 19:49:46.000'),
('d9e5cd82-3a2f-4c6e-a064-c6b6b787b33c', 'hr.manage', 'Manage Employees & Payroll', 'HR', '2026-02-06 16:10:24.000'),
('ec491c27-a37c-444c-bd6e-18304b2a03da', 'tickets.manage', 'Manage Job Tickets', 'Tickets', '2026-02-06 16:10:24.000');

-- Table structure for table `products`
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_path` text NOT NULL,
  `description` text DEFAULT NULL,
  `price_retail` decimal(10,2) NOT NULL,
  `price_cost` decimal(10,2) DEFAULT 0.00,
  `weight_g` int(11) DEFAULT 0,
  `price_sale` decimal(10,2) DEFAULT 0.00,
  `tax_code` varchar(20) NOT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `inventory_strategy` varchar(20) DEFAULT 'FIFO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `long_description` text DEFAULT NULL,
  `warranty_period` varchar(100) DEFAULT NULL,
  `warranty_policy` text DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `whats_included` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`whats_included`)),
  `variations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variations`)),
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`)),
  `image` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `products`
INSERT INTO `products` VALUES 
('05acb67e-859c-47fe-8d1c-237470836a38', 'MC4-CONN', 'MC4 Connector Pair', '/solar-power/solar-accessories/', 'IP67 Waterproof connectors.', '450.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 'wew', 'test productw', '/solar-power/', '', '100.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:30:36.000', '2026-02-11 13:43:40.000', '', NULL, NULL, '[]', '[]', '{}', '[\"/uploads/products/1770724752190-526843067-WhatsApp_Image_2026-02-10_at_10.24.57_(1).jpeg\"]', '/uploads/products/1770724752190-526843067-WhatsApp_Image_2026-02-10_at_10.24.57_(1).jpeg'),
('15c15df8-e8c8-42ee-84f9-4b43581bd222', 'SOL-PNL-450W', 'Jinko Solar Tiger Neo 450W', 'solar-panels', 'High efficiency N-type mono module.', '45000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Cell Type\":\"N-Type Monocrystalline\",\"Weight\":\"22kg\",\"Dimensions\":\"1903x1134x30mm\",\"Max Power\":\"450W\",\"Efficiency\":\"22.5%\",\"Junction Box\":\"IP68\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'The Jinko Solar Tiger Neo 450W module adopts N-type HOT 2.0 technology with better reliability and lower LID/LETID. Equipped with SMBB technology to improve light trapping and current collection, this module is designed for maximum energy yield even in low-light conditions.', '25 Years Product, 30 Years Power', NULL, '[\"N-Type Technology\",\"SMBB Technology\",\"Anti-PID\",\"Durability against extreme environments\",\"High Efficiency 22.5%\"]', '[\"1x Solar Panel\",\"1x User Manual\",\"1x Warranty Card\"]', '{}', NULL, NULL),
('278266f1-7154-441d-82aa-cc9614ca774e', 'DC-BREAKER-20A', 'DC Breaker 20A 500V', 'computers', 'Circuit breaker for PV strings.', '2500.00', '100.00', 200, '2300.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:14:54.000', '', NULL, NULL, '[]', '[]', '{}', '[]', NULL),
('38f54d02-9b4c-4ebd-ae29-d9eb62bd269c', 'CABLE-PV-4MM-B', 'PV Cable 4mm (Black)', 'solar-accessories', 'UV resistant solar cable, per meter.', '350.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('3b377154-0e95-4eb5-988c-8705c589fab0', 'SOL-PNL-JA-545', 'JA Solar DeepBlue 3.0 545W', 'solar-panels', 'High performance module with 11BB technology.', '50500.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('4665a19b-afba-45f0-9232-28ba09e252b7', 'CABLE-PV-4MM', 'PV Cable 4mm (Red)', 'solar-accessories', 'UV resistant solar cable, per meter.', '350.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Cross Section\":\"4mm²\",\"Conductor\":\"Tinned Copper\",\"Voltage\":\"1500V DC\",\"Temp Range\":\"-40°C to +90°C\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'High-quality 4mm PV Solar Cable designed for connecting photovoltaic power supply systems. UV resistant, robust, and durable for outdoor use.', '25 Years Service Life', NULL, '[\"TUV Certified\",\"UV Resistant\",\"Double Insulated\",\"Halogen Free\"]', '[\"Cable Reel\"]', '{\"Color\":[\"Red\",\"Black\"],\"Length\":[\"100m Roll\",\"500m Roll\"]}', NULL, NULL),
('4df63c99-77c3-4abe-b5a5-d47c1c02f6d0', 'SMART-PLUG-13A', 'Tuya Smart Plug 13A', '/electrical/switches-sockets/', 'Energy monitoring smart plug.', '3200.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('55c5b9a4-1803-44c2-a429-6be146065088', 'SVC-INSTALL-5KW', 'Solar Installation (5kW)', 'Services/Labor', 'Complete installation and commissioning.', '75000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Capacity\":\"Up to 5kW\",\"Duration\":\"2-3 Days\",\"Team Size\":\"3 Technicians\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-02 19:28:19.000', 'Complete turnkey installation service for a 5kW Solar System. Includes site inspection, engineering design, installation by SLSEA certified technicians, and CEB/LECO grid connection coordination.', '2 Years Workmanship Warranty', NULL, '[\"SLSEA Certified Engineering\",\"Premium Installation Materials\",\"Grid Connection Handling\",\"Commissioning & Training\"]', '[\"Labor\",\"Transport\",\"Mounting Accessories\",\"Conduit/Casing\"]', '{}', NULL, NULL),
('5b1b2ea3-0b4a-4e6e-982d-b2a62f5e473e', 'TP1', 'test product 1', '/electrical/', '111111111', '11.00', '10.00', 11, '11.00', 'VAT_18', '{\"da\":\"dad\"}', 'FIFO', '2026-02-07 11:43:22.000', '2026-02-11 13:43:40.000', 'fsfs', NULL, NULL, '[\"adad\"]', '[\"adada\"]', '{\"color\":[\"red\",\"green\"]}', '[\"/uploads/products/1770444486614-93467329-Gemini_Generated_Image_ijqaltijqaltijqa.png\",\"/uploads/products/1770444486666-814257760-WhatsApp_Image_2026-02-05_at_15.18.55.jpeg\",\"/uploads/products/1770444486717-115426761-WhatsApp_Image_2026-02-05_at_15.18.54_(1).jpeg\"]', '/uploads/products/1770444486614-93467329-Gemini_Generated_Image_ijqaltijqaltijqa.png'),
('5cb09ae1-dfd1-4734-9f42-2866779927f6', 'ELE-OR-13A', 'Orange Electric 13A Socket', '/electrical/', 'High quality Orange Electric 13A Socket suitable for residential and commercial use. 5-year warranty included.', '850.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Amps\":\"13A\",\"Color\":\"White\"}', 'FIFO', '2026-01-29 09:47:12.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('6e1fbfe5-0460-4025-a504-24139c5932b1', 'SOL-PNL-550W', 'Jinko Solar Tiger Pro 550W', 'solar-panels', 'Ultra-high power for large installations.', '52000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Cell Type\":\"P-Type Monocrystalline\",\"Weight\":\"28kg\",\"Dimensions\":\"2278x1134x35mm\",\"Max Power\":\"550W\",\"Efficiency\":\"21.5%\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'Jinko Solar Tiger Pro 550W is a high-power module designed for utility-scale and commercial projects. Featuring Multi-Busbar technology, it ensures better light trapping and current collection to improve module power output and reliability.', '12 Years Product, 25 Years Power', NULL, '[\"Multi Busbar Technology\",\"Reduced Hot Spot Loss\",\"Longer Lifetime Power Yield\",\"Enhanced Mechanical Load\"]', '[\"1x Solar Panel\",\"1x Manual\"]', '{}', NULL, NULL),
('7d16150d-7397-4489-9fa2-4956bb0df5dd', 'SMART-SW-3G', 'Tuya Smart Switch 3-Gang', 'switches-sockets', 'WiFi + Bluetooth, 3-Gang touch switch.', '6500.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('80d0d899-a223-4fe2-b1b0-2622487bd349', 'SMART-CAM-OUT', 'Outdoor WiFi Camera 1080p', 'Smart Home/Security', 'Weatherproof security camera with night vision.', '12500.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-02 19:28:19.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('85debd86-2815-452e-b956-44e84e3e16d9', 'BAT-LFP-10K', 'Huawei LUNA2000-10-E0 (10kWh)', 'batteries', '10kWh Smart Energy Storage System.', '1200000.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 'CABLE-AC-6MM', 'ACL 6mm 2-Core Cable', 'solar-power/batteries', 'ssssss', '850.00', '100.00', 2000, '600.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:34:50.000', 'ssssssssssssssssssssss', NULL, NULL, '[]', '[]', '{\"color\":[\"red\",\"green\",\"blue\",\"green\"],\"Length\":[\"2\",\"4\",\"5\",\"8\"]}', '[\"/uploads/products/1770454396315-560053532-Gemini_Generated_Image_ijqaltijqaltijqa.png\"]', '/uploads/products/1770454396315-560053532-Gemini_Generated_Image_ijqaltijqaltijqa.png'),
('8964cb71-b3ae-416c-906a-c6a3297e778a', 'BAT-PYLON-3K', 'Pylontech US3000C 3.5kWh', '/solar-power/batteries/', 'Reliable LiFePO4 battery for hybrid systems.', '420000.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('8e91e875-b516-4335-9584-aa9d7b27db68', 'INV-HUA-10K', 'Huawei SUN2000-10KTL-M1', 'inverters', 'High current hybrid inverter, Three Phase.', '420000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Power\":\"10kW\",\"Phase\":\"Three\",\"Max Efficiency\":\"98.6%\",\"Weight\":\"17kg\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'Huawei SUN2000-10KTL-M1 is a three-phase smart inverter ideal for residential and small commercial systems. It features high efficiency up to 98.6% and compact design.', '10 Years Manufacturer Warranty', NULL, '[\"Three Phase\",\"High Efficiency 98.6%\",\"Integrated PID Recovery\",\"Battery Interface\"]', '[\"1x Inverter\",\"1x Wall Mount\",\"Connectors\"]', '{}', NULL, NULL),
('8fbf6376-8569-45fc-8bd5-c0a6b09d41cc', 'SPD-DC-1000V', 'DC Surge Protector 1000V', '/solar-power/', 'Lightning protection for solar arrays.', '6500.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 13:43:40.000', '', NULL, NULL, '[]', '[]', '{\"color\":[\"red\",\"green\",\"blue\",\"green\"],\"Length\":[\"2\",\"4\",\"5\",\"8\"]}', '[]', NULL),
('9453f3d0-7b2d-485c-ba6b-41bb594d3c13', 'INV-GROW-5K', 'Growatt 5000ES Hybrid', 'computers', 'Cost-effective off-grid/hybrid inverter.', '230000.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:36:19.000', '', NULL, NULL, '[]', '[]', '{}', '[]', NULL),
('94ba0cd8-dc8f-4663-9aa1-18b5f0c073fc', 'SOL-JK-450', 'Jinko Solar Tiger Neo 54HL4-B 450W', '/solar-power/solar-panels/', 'High quality Jinko Solar Tiger Neo 54HL4-B 450W suitable for residential and commercial use. 5-year warranty included.', '45000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Wattage\":\"450W\",\"Type\":\"N-type Mono\"}', 'FIFO', '2026-01-29 09:47:12.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('b9d90291-595d-48d8-b906-1c3f8567ff6b', 'SMART-SW-1G', 'Tuya Smart Switch 1-Gang', 'switches-sockets', 'WiFi + Bluetooth, No Neutral required.', '4500.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Gang\":\"1\",\"Wireless\":\"WiFi 2.4GHz\",\"Max Load\":\"800W\",\"Material\":\"Tempered Glass Panel\",\"Voltage\":\"110-240V\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'Control your lights from anywhere with the Tuya Smart Switch. Compatible with Alexa and Google Home, this switch requires no neutral wire, making it perfect for older homes with traditional wiring.', '1 Year Warranty', NULL, '[\"Voice Control\",\"App Control (Tuya/Smart Life)\",\"Timer/Schedule\",\"Share Control\",\"No Neutral Required\"]', '[\"1x Switch\",\"1x Capacitor\",\"2x Screws\",\"1x Manual\"]', '{\"Color\":[\"White\",\"Black\",\"Gold\"]}', NULL, NULL),
('cbeed008-b0b5-4866-8ce5-848fff8f86df', 'BAT-LFP-5K', 'Huawei LUNA2000-5-E0 (5kWh)', 'batteries', 'Smart String Energy Storage System.', '650000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Capacity\":\"5kWh\",\"Technology\":\"LiFePO4\",\"Weight\":\"50kg\",\"Cycle Life\":\"6000+\",\"Voltage\":\"350-560V\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'Huawei LUNA2000-5-E0 is a modular 5kWh lithium battery module that can be stacked up to 15kWh. It features 100% depth of discharge and optimization at the module level, ensuring safety and longevity.', '10 Years Performance Warranty', NULL, '[\"Modular Design (5kWh-30kWh)\",\"100% Depth of Discharge\",\"Lithium Iron Phosphate (LFP)\",\"Easy Installation\",\"Auto-App Discovery\"]', '[\"1x Battery Module\",\"1x Power Module\",\"Cables\",\"Base\"]', '{}', NULL, NULL),
('d53d6423-c2df-430b-ab76-6d8234f2862b', 'INV-SMA-5K', 'SMA Sunny Boy 5.0', '/solar-power/inverters/', 'German engineered reliable solar inverter.', '350000.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('dd4f078d-74cf-44d4-a5f6-1fe777a3eda8', 'SMART-BULB-RGB', 'Smart WiFi LED Bulb RGB', '/electrical/lighting/', 'Color changing smart bulb E27.', '2800.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('e4c43af7-9de9-46fc-99db-28c7713e0f6e', 'SVC-SERVICE-GEN', 'General Service Visit', 'solar-power/batteries', 'Inspection and cleaning.', '5000.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:21:39.000', '', NULL, NULL, '[]', '[]', '{}', '[]', NULL),
('e54158de-a53a-4b08-8025-9342db9ff138', 'SOL-PNL-CAN-550', 'Canadian Solar HiKu6 550W', 'solar-panels', 'High power mono PERC module.', '51000.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', '', NULL, NULL, '[]', '[]', '{}', '[\"/uploads/products/1770459272070-409460455-WhatsApp_Image_2026-02-05_at_15.18.55_(1).jpeg\"]', '/uploads/products/1770459272070-409460455-WhatsApp_Image_2026-02-05_at_15.18.55_(1).jpeg'),
('f42252b1-7fd3-45c2-bad8-b15d85eaa20b', 'INV-HU-5K', 'Huawei SUN2000-5KTL-L1 Inverter', '/solar-power/inverters/', 'High quality Huawei SUN2000-5KTL-L1 Inverter suitable for residential and commercial use. 5-year warranty included.', '285000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Power\":\"5kW\",\"Phase\":\"Single\"}', 'FIFO', '2026-01-29 09:47:12.000', '2026-02-11 13:43:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('f447f164-722f-4957-8c6d-62a7f77eae53', 'SMART-SW-2G', 'Tuya Smart Switch 2-Gang', 'switches-sockets', 'WiFi + Bluetooth, 2-Gang touch switch.', '5500.00', '0.00', 5000, '0.00', 'VAT_18', '{}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('fac560a6-4b92-4e39-afab-ebd37f49193a', 'INV-HUA-5K', 'Huawei SUN2000-5KTL-L1', 'inverters', 'Smart Energy Center, Single Phase.', '285000.00', '0.00', 5000, '0.00', 'VAT_18', '{\"Power\":\"5kW\",\"Phase\":\"Single\",\"Max Input Voltage\":\"600V\",\"IP Rating\":\"IP65\",\"Weight\":\"12kg\",\"Comm\":\"RS485, WLAN\"}', 'FIFO', '2026-01-30 21:34:06.000', '2026-02-11 14:58:56.000', 'The Huawei SUN2000-5KTL-L1 is a smart hybrid inverter that supports both grid-tied and off-grid operations with battery backup. It offers AI-powered arcing protection (AFCI) and is compatible with Huawei LUNA2000 batteries for a complete energy storage solution.', '10 Years Manufacturer Warranty', NULL, '[\"AI Powered Arcing Protection\",\"Battery Ready\",\"Higher Efficiency\",\"Quiet Operation (Fanless)\",\"WLAN Included\"]', '[\"1x Inverter\",\"1x Wall Mount Bracket\",\"1x WiFi Dongle\",\"1x AC Connector\",\"1x DC Connector Set\"]', '{}', NULL, NULL);

-- Table structure for table `public_holidays`
DROP TABLE IF EXISTS `public_holidays`;
CREATE TABLE `public_holidays` (
  `id` char(36) NOT NULL,
  `date` date NOT NULL,
  `name` varchar(100) NOT NULL,
  `holiday_type` enum('poya','national','special') NOT NULL,
  `ot_multiplier` decimal(3,2) DEFAULT 2.00,
  `year` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  KEY `idx_date` (`date`),
  KEY `idx_year` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `public_holidays`

-- Table structure for table `role_permissions`
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` char(36) NOT NULL,
  `permission_id` char(36) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `role_permissions`
INSERT INTO `role_permissions` VALUES 
('0b7fc842-f956-4321-b4cc-486a04f28780', '71926c9a-8a88-4d75-a1f2-5211eac90f19'),
('0b7fc842-f956-4321-b4cc-486a04f28780', 'd9e5cd82-3a2f-4c6e-a064-c6b6b787b33c'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', '0400d459-bd2e-4fe4-bba9-f47bffa167fe'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', '157dd05a-75ba-4c2e-a4f3-0afc4e193343'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', '620f7165-5548-4951-9e7b-3daa1e2da885'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', '71926c9a-8a88-4d75-a1f2-5211eac90f19'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', 'd9e5cd82-3a2f-4c6e-a064-c6b6b787b33c'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', 'ec491c27-a37c-444c-bd6e-18304b2a03da'),
('3c34b622-2285-4722-8604-ea2f2606bf0c', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('3c34b622-2285-4722-8604-ea2f2606bf0c', 'ec491c27-a37c-444c-bd6e-18304b2a03da'),
('56abcc96-6c84-4c14-b1ec-a4a6beab8970', '157dd05a-75ba-4c2e-a4f3-0afc4e193343'),
('56abcc96-6c84-4c14-b1ec-a4a6beab8970', '4e2e5f0d-da92-4017-a4e1-39f8d6892e5d'),
('56abcc96-6c84-4c14-b1ec-a4a6beab8970', '620f7165-5548-4951-9e7b-3daa1e2da885'),
('56abcc96-6c84-4c14-b1ec-a4a6beab8970', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('768da12a-4917-40d9-a43d-8f19bfca5038', '4e2e5f0d-da92-4017-a4e1-39f8d6892e5d'),
('768da12a-4917-40d9-a43d-8f19bfca5038', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('7a5a31ed-6f7e-4705-837a-18f35751d080', '22ebce3e-ad52-4bfb-a292-e29357ca14df'),
('7a5a31ed-6f7e-4705-837a-18f35751d080', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('7a5a31ed-6f7e-4705-837a-18f35751d080', '71926c9a-8a88-4d75-a1f2-5211eac90f19'),
('7a5a31ed-6f7e-4705-837a-18f35751d080', 'd9e5cd82-3a2f-4c6e-a064-c6b6b787b33c'),
('8ef9064b-f8cd-42cf-bbb8-06961bd89568', '620f7165-5548-4951-9e7b-3daa1e2da885'),
('be55ac93-a47e-4ddb-b3b5-0e3b5a4bdd62', '157dd05a-75ba-4c2e-a4f3-0afc4e193343'),
('be55ac93-a47e-4ddb-b3b5-0e3b5a4bdd62', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('be55ac93-a47e-4ddb-b3b5-0e3b5a4bdd62', 'ec491c27-a37c-444c-bd6e-18304b2a03da'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '0400d459-bd2e-4fe4-bba9-f47bffa167fe'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '053b965f-7252-4a8a-ae1a-1c51475f12c2'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '125e380c-43c3-4c13-ab30-d0d684098d46'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '157dd05a-75ba-4c2e-a4f3-0afc4e193343'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '22ebce3e-ad52-4bfb-a292-e29357ca14df'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '620f7165-5548-4951-9e7b-3daa1e2da885'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', '71926c9a-8a88-4d75-a1f2-5211eac90f19'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', 'categories.manage'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', 'd9e5cd82-3a2f-4c6e-a064-c6b6b787b33c'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', 'ec491c27-a37c-444c-bd6e-18304b2a03da'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '0400d459-bd2e-4fe4-bba9-f47bffa167fe'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '053b965f-7252-4a8a-ae1a-1c51475f12c2'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '125e380c-43c3-4c13-ab30-d0d684098d46'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '157dd05a-75ba-4c2e-a4f3-0afc4e193343'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '1b3644a5-2df5-4e8f-ba37-be9117329962'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '22ebce3e-ad52-4bfb-a292-e29357ca14df'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '4e2e5f0d-da92-4017-a4e1-39f8d6892e5d'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '55f9ab20-0a47-4e39-bd46-7e11d022c425'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '620f7165-5548-4951-9e7b-3daa1e2da885'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '649e93ad-dccc-4d8a-b091-c14f4be203e3'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '71926c9a-8a88-4d75-a1f2-5211eac90f19'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', '94065acd-37bc-435d-9cec-2b4cb775c173'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', 'b2747eed-5be6-4ab3-aad7-7f1a748f3dad'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', 'ba3f97cf-046d-4329-90e5-dc251f1c709e'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', 'categories.manage'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', 'd9e5cd82-3a2f-4c6e-a064-c6b6b787b33c'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', 'ec491c27-a37c-444c-bd6e-18304b2a03da');

-- Table structure for table `roles`
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `roles`
INSERT INTO `roles` VALUES 
('0b7fc842-f956-4321-b4cc-486a04f28780', 'HR Staff', 'hr_staff', 'System role: HR Staff', 1, '2026-02-06 16:10:24.000'),
('272978c9-ce56-4ed2-a1cf-0ab5d9f22311', 'Manager', 'manager', 'System role: Manager', 1, '2026-02-06 16:10:24.000'),
('3c34b622-2285-4722-8604-ea2f2606bf0c', 'Technician', 'technician', 'System role: Technician', 1, '2026-02-06 16:10:24.000'),
('56abcc96-6c84-4c14-b1ec-a4a6beab8970', 'custom1', 'custom1', 'test1', 0, '2026-02-09 05:24:49.000'),
('768da12a-4917-40d9-a43d-8f19bfca5038', 'E-commerce Admin', 'ecommerce_admin', 'System role: E-commerce Admin', 1, '2026-02-06 16:10:24.000'),
('7a5a31ed-6f7e-4705-837a-18f35751d080', 'Accountant', 'accountant', 'System role: Accountant', 1, '2026-02-06 16:10:24.000'),
('8ef9064b-f8cd-42cf-bbb8-06961bd89568', 'Cashier', 'cashier', 'System role: Cashier', 1, '2026-02-06 16:10:24.000'),
('be55ac93-a47e-4ddb-b3b5-0e3b5a4bdd62', 'Repair Center Admin', 'repair_admin', 'System role: Repair Center Admin', 1, '2026-02-06 16:10:24.000'),
('ef5f88a0-36eb-49cc-8545-e40f320856e0', 'Admin', 'admin', 'System role: Admin', 1, '2026-02-06 16:10:24.000'),
('f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603', 'Super User', 'super_user', 'System role: Super User', 1, '2026-02-06 16:10:24.000');

-- Table structure for table `rosters`
DROP TABLE IF EXISTS `rosters`;
CREATE TABLE `rosters` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `location_id` char(36) DEFAULT NULL,
  `shift_id` char(36) DEFAULT NULL,
  `date` date NOT NULL,
  `is_day_off` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_roster` (`employee_id`,`date`),
  KEY `shift_id` (`shift_id`),
  KEY `idx_date` (`date`),
  CONSTRAINT `rosters_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `rosters_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `rosters`

-- Table structure for table `sales_items`
DROP TABLE IF EXISTS `sales_items`;
CREATE TABLE `sales_items` (
  `id` char(36) NOT NULL,
  `order_id` char(36) DEFAULT NULL,
  `product_id` char(36) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `variant_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variant_options`)),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `sales_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`id`),
  CONSTRAINT `sales_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `sales_items`
INSERT INTO `sales_items` VALUES 
('05726d1d-b788-4bb6-a0e7-099a58e26014', 'afe64a04-df31-453d-b3f9-265e27c6bfca', '38f54d02-9b4c-4ebd-ae29-d9eb62bd269c', 1, '350.00', '350.00', NULL),
('1813e721-9bf8-41ce-98be-0918dad944bb', 'dd46193e-a600-46b3-8b3c-9bb100ac1e12', '15c15df8-e8c8-42ee-84f9-4b43581bd222', 2, '45000.00', '90000.00', NULL),
('1f675848-8231-4f6c-95b1-f8fd4fd961d8', 'afe64a04-df31-453d-b3f9-265e27c6bfca', '7d16150d-7397-4489-9fa2-4956bb0df5dd', 1, '6500.00', '6500.00', NULL),
('24e728f2-2ea7-4bfb-9ba9-774eeb2c4943', '58b6fcc7-ef80-434f-ae18-f34fa4db526d', '15c15df8-e8c8-42ee-84f9-4b43581bd222', 1, '45000.00', '45000.00', NULL),
('25651e69-acdd-41ee-8694-835413d9b317', 'd57c4b89-bd6f-4656-95a9-15fc5d43a648', '278266f1-7154-441d-82aa-cc9614ca774e', 1, '2500.00', '2500.00', NULL),
('32fde54b-1343-4ca9-be7e-189f725028cd', 'f537a703-c1e5-4c47-a69a-2f2b43f49129', '15c15df8-e8c8-42ee-84f9-4b43581bd222', 2, '45000.00', '90000.00', NULL),
('6ec7ded7-0750-40fe-a6b4-397d5ec2b5b9', '101d82d5-2542-484d-bfd9-81bc4cf4df14', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 1, '100.00', '100.00', NULL),
('7003bc31-f005-4e78-a33b-75af9a48b8ec', '2cba1724-2e1f-4a31-bc89-d22f8f28ae0d', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 1, '100.00', '100.00', NULL),
('78cb29da-f752-4958-a7c5-70cba3bf0abc', '2cba1724-2e1f-4a31-bc89-d22f8f28ae0d', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 1, '850.00', '850.00', NULL),
('7e6d3175-ffdd-436f-a4bb-49e8789636e4', '58b6fcc7-ef80-434f-ae18-f34fa4db526d', '3b377154-0e95-4eb5-988c-8705c589fab0', 1, '50500.00', '50500.00', NULL),
('8390b0fd-2c01-4ce1-b26f-85bd4dae43e9', 'dd46193e-a600-46b3-8b3c-9bb100ac1e12', '5cb09ae1-dfd1-4734-9f42-2866779927f6', 1, '850.00', '850.00', NULL),
('83dd066f-6693-44f6-b14a-503f86cb0170', 'f537a703-c1e5-4c47-a69a-2f2b43f49129', '05acb67e-859c-47fe-8d1c-237470836a38', 5, '850.00', '4250.00', NULL),
('89825f3d-b789-4079-a7b4-4b4f4e391fea', '4a3a66b0-4376-46f5-b794-528d1b09eeba', '278266f1-7154-441d-82aa-cc9614ca774e', 1, '2500.00', '2500.00', NULL),
('9520fb38-6882-4329-8512-75d8b0f267fb', '6d4e724c-e71e-495d-b4d3-2c8f5abc45bb', '5b1b2ea3-0b4a-4e6e-982d-b2a62f5e473e', 1, '11.00', '11.00', NULL),
('9cf1cddd-64ad-4805-93ab-7995770e2d8f', '2cba1724-2e1f-4a31-bc89-d22f8f28ae0d', '278266f1-7154-441d-82aa-cc9614ca774e', 1, '2500.00', '2500.00', NULL),
('a5dc24f2-f162-4a46-a03e-d3b4b2b16897', '4a3a66b0-4376-46f5-b794-528d1b09eeba', '05acb67e-859c-47fe-8d1c-237470836a38', 1, '450.00', '450.00', NULL),
('a8226c6d-8f0d-4850-ac04-71604528c64e', 'dd46193e-a600-46b3-8b3c-9bb100ac1e12', '3b377154-0e95-4eb5-988c-8705c589fab0', 1, '50500.00', '50500.00', NULL),
('aa92c15d-87b4-4185-ae93-c5aceab0cfe0', '6d4e724c-e71e-495d-b4d3-2c8f5abc45bb', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 1, '100.00', '100.00', NULL),
('ae4ae34f-bac3-484f-aa70-c8c398a9c3d5', '58c32ceb-e818-44db-9f7b-97f893747d66', '278266f1-7154-441d-82aa-cc9614ca774e', 1, '2500.00', '2500.00', NULL),
('b3a8c7b5-9035-4157-9fc5-19bb35e476e9', '15cbe3d0-f39c-440a-b7e0-5c2c9c6091fa', '4665a19b-afba-45f0-9232-28ba09e252b7', 1, '350.00', '350.00', NULL),
('c8bd0c7d-1957-4347-993c-1b67fd0f8999', 'd3dba070-4a75-4342-8c8a-97f5b4d7ae3d', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 2, '600.00', '1200.00', '{\"color\":\"blue\",\"Length\":\"5\"}'),
('cca185e3-f82f-4e3b-be1d-1ee805c24cf5', '6d4e724c-e71e-495d-b4d3-2c8f5abc45bb', '278266f1-7154-441d-82aa-cc9614ca774e', 1, '2500.00', '2500.00', NULL),
('e3f329df-1f1c-4908-b2b7-6f559ec8dad2', 'd57c4b89-bd6f-4656-95a9-15fc5d43a648', '4665a19b-afba-45f0-9232-28ba09e252b7', 1, '350.00', '350.00', NULL),
('fbe8495f-eba2-4bd5-9fba-f178be1cc81f', '101d82d5-2542-484d-bfd9-81bc4cf4df14', '5cb09ae1-dfd1-4734-9f42-2866779927f6', 1, '850.00', '850.00', NULL);

-- Table structure for table `sales_orders`
DROP TABLE IF EXISTS `sales_orders`;
CREATE TABLE `sales_orders` (
  `id` char(36) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_id` char(36) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `location_id` char(36) DEFAULT NULL,
  `cashier_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sync_status` varchar(20) DEFAULT 'SYNCED',
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `order_source` varchar(20) DEFAULT 'POS',
  `delivery_status` varchar(20) DEFAULT 'PENDING',
  `payment_proof` varchar(512) DEFAULT NULL,
  `delivery_method` varchar(20) DEFAULT 'delivery',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `sales_orders_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `sales_orders`
INSERT INTO `sales_orders` VALUES 
('101d82d5-2542-484d-bfd9-81bc4cf4df14', 'ORD-411619', NULL, '950.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 15:13:31.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('15cbe3d0-f39c-440a-b7e0-5c2c9c6091fa', 'ORD-176207', NULL, '350.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 10:42:56.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('2cba1724-2e1f-4a31-bc89-d22f8f28ae0d', 'ORD-683174', NULL, '3450.00', 'COMPLETED', 'ONLINE', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 20:01:23.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('41f88476-39c9-4e69-8d65-03e816abdfcd', 'ONL-300112', NULL, '94250.00', 'PENDING', 'cod', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 15:45:00.000', 'SYNCED', 'Janith Weerasinghe', '0764522262', '', 'a, ada', 'ONLINE', 'PENDING', NULL, 'delivery'),
('4a3a66b0-4376-46f5-b794-528d1b09eeba', 'ONL-124577', NULL, '2950.00', 'PENDING', 'bank_transfer', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 16:15:24.000', 'SYNCED', 'Janith Weerasinghe', '0764522262', '', 'a, ada', 'ONLINE', 'CONFIRMED', '/uploads/receipts/4a3a66b0-4376-46f5-b794-528d1b09eeba-WhatsAppImage20260108at12.31.321.jpeg', 'delivery'),
('58b6fcc7-ef80-434f-ae18-f34fa4db526d', 'ORD-285210', NULL, '95500.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 09:04:45.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('58c32ceb-e818-44db-9f7b-97f893747d66', 'ORD-159886', NULL, '2500.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 10:42:39.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('6d4e724c-e71e-495d-b4d3-2c8f5abc45bb', 'ORD-316734', NULL, '2611.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-07 21:51:56.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('81988b87-456e-42d9-a410-a4c61515f17c', 'ONL-675457', NULL, '94250.00', 'PENDING', 'cod', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 15:51:15.000', 'SYNCED', 'Janith Weerasinghe', '0764522262', '', 'a, ada', 'ONLINE', 'PENDING', NULL, 'delivery'),
('afe64a04-df31-453d-b3f9-265e27c6bfca', 'ORD-072201', NULL, '6850.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 10:41:12.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('bcd4b525-43ea-49ca-bc34-f8b79898ba12', 'ONL-292362', NULL, '94250.00', 'PENDING', 'cod', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 15:44:52.000', 'SYNCED', 'Janith Weerasinghe', '0764522262', '', 'a, ada', 'ONLINE', 'PENDING', NULL, 'delivery'),
('caceb2cb-378a-487e-9d36-7ae71863d9b7', 'ONL-277897', NULL, '94250.00', 'PENDING', 'cod', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 15:44:37.000', 'SYNCED', '', '', '', ', ', 'ONLINE', 'PENDING', NULL, 'delivery'),
('d3dba070-4a75-4342-8c8a-97f5b4d7ae3d', 'ONL-314070', NULL, '1950.00', 'PENDING', 'cod', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-07 14:21:54.000', 'SYNCED', 'Janith Weerasingha', '0764522262', 'bsprk1@gmail.com', 'No 104, Obadaella, Nuwaraeliya', 'ONLINE', 'PENDING', NULL, 'delivery'),
('d57c4b89-bd6f-4656-95a9-15fc5d43a648', 'ORD-770675', NULL, '2850.00', 'COMPLETED', 'CARD', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 10:36:10.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('dd46193e-a600-46b3-8b3c-9bb100ac1e12', 'ORD-910701', NULL, '141350.00', 'COMPLETED', 'CASH', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 10:38:30.000', 'SYNCED', NULL, NULL, NULL, NULL, 'POS', 'PENDING', NULL, 'delivery'),
('f537a703-c1e5-4c47-a69a-2f2b43f49129', 'ONL-705727', NULL, '94250.00', 'PENDING', 'cod', 'd1c1cfd5-eec0-4d72-8961-04b0d154ef59', NULL, '2026-02-02 15:51:45.000', 'SYNCED', 'Janith Weerasinghe', '0764522262', '', 'a, ada', 'ONLINE', 'PENDING', NULL, 'delivery');

-- Table structure for table `shifts`
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `break_duration_mins` int(11) DEFAULT 60,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `shifts`

-- Table structure for table `static_pages`
DROP TABLE IF EXISTS `static_pages`;
CREATE TABLE `static_pages` (
  `slug` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `static_pages`
INSERT INTO `static_pages` VALUES 
('privacy-policy', 'Privacy Policy', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2026-02-02 16:47:38.000'),
('refund-policy', 'Refund Policy', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2026-02-02 16:47:38.000'),
('terms-conditions', 'Terms & Conditions', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2026-02-02 16:47:38.000');

-- Table structure for table `technician_scores`
DROP TABLE IF EXISTS `technician_scores`;
CREATE TABLE `technician_scores` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `ticket_id` char(36) DEFAULT NULL,
  `period_month` int(11) NOT NULL,
  `period_year` int(11) NOT NULL,
  `tickets_assigned` int(11) DEFAULT 0,
  `tickets_completed` int(11) DEFAULT 0,
  `avg_resolution_hours` decimal(6,2) DEFAULT NULL,
  `first_time_fix_rate` decimal(5,2) DEFAULT NULL,
  `warranty_returns` int(11) DEFAULT 0,
  `customer_rating` decimal(3,2) DEFAULT NULL,
  `efficiency_score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_employee_period` (`employee_id`,`period_year`,`period_month`),
  CONSTRAINT `technician_scores_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `technician_scores`

-- Table structure for table `ticket_history`
DROP TABLE IF EXISTS `ticket_history`;
CREATE TABLE `ticket_history` (
  `id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `ticket_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `ticket_history`
INSERT INTO `ticket_history` VALUES 
('0abe4905-b96e-4000-bc7f-f9913d582d63', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to INSPECTION', NULL, '2026-01-31 22:19:38.000'),
('148ddeaf-4350-418c-ba64-eb7f06cf49f7', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Inspection Note: capasitor blasted', NULL, '2026-02-02 20:06:55.000'),
('247be8b0-a269-4fb8-ad07-93f96259cd06', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to CLEANING', NULL, '2026-02-02 20:08:36.000'),
('34245811-0daf-42c5-8e46-f09c85b855a3', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to TESTING', NULL, '2026-02-02 20:08:23.000'),
('39a77922-73e5-4fc4-bab2-43aa90733dfb', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Diagnosis notes updated', NULL, '2026-01-31 22:16:19.000'),
('43a66063-a2c5-4f59-a110-0b533a2ff135', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to DIAGNOSIS', NULL, '2026-01-31 22:26:35.000'),
('60c16e7e-a1cc-4b18-8cb7-c55093cec043', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to DIAGNOSIS', NULL, '2026-02-02 20:06:55.000'),
('778e6375-9555-42b6-a702-404c7cdc533c', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to CLEANING', NULL, '2026-01-31 22:19:10.000'),
('8318d201-f932-4647-8950-ebab9531cead', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to INSPECTION', NULL, '2026-02-02 20:06:21.000'),
('8c888191-e26c-42a6-8325-35291d060f4e', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Repair notes updated', NULL, '2026-01-31 22:16:36.000'),
('8cf8f427-33b2-4ae2-b789-8bbcd7254d3b', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Repair Note: few screatched 3', NULL, '2026-02-02 20:08:23.000'),
('9a3ff74c-ae2d-4d9d-b28a-ee8b372b57b4', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to IN_REPAIR', NULL, '2026-02-02 20:08:16.000'),
('9e4d728c-f050-47d5-b539-42c92e000551', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to TESTING', NULL, '2026-01-31 22:16:36.000'),
('a5986850-2580-4beb-946e-53fc7f87cd17', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to CLOSED', NULL, '2026-01-31 22:26:57.000'),
('aacd09b7-3d42-4739-a942-92e167251be7', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to IN_REPAIR', NULL, '2026-01-31 22:16:25.000'),
('b72a4a39-8200-42fb-bf7b-4640ede521a9', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to BILLING', NULL, '2026-01-31 22:19:16.000'),
('b9f3b4ba-57c3-4daf-8292-bd32e4375f72', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Inspection Note: few screatched', NULL, '2026-01-31 22:26:35.000'),
('bb032195-b7f3-44a8-af0d-1da088a62f0e', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to WAITING_APPROVAL', NULL, '2026-02-02 20:07:44.000'),
('c233dc0c-bdcc-4b2a-8fe8-019371b411ac', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to DELIVERED', NULL, '2026-01-31 22:19:29.000'),
('c5cecbca-64c8-4dbf-ac6e-93a392fc99b7', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Diagnosis Note: few screatched 4', NULL, '2026-02-02 20:07:44.000'),
('e45713a6-0603-47f7-9c3e-581c59816893', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to DELIVERED', NULL, '2026-02-02 20:08:47.000'),
('e75ae6d6-9796-49dd-a80d-325f786511c1', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to BILLING', NULL, '2026-02-02 20:08:41.000'),
('e9cc6707-9953-465d-b911-5bb6955d8c71', '1be055bc-6831-4583-a674-5208c69b4075', 'NOTE_ADDED', 'Diagnosis Note: few screatched 4', NULL, '2026-01-31 22:26:48.000'),
('f225762a-9bcf-4ccc-b86a-e600d0085276', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to WAITING_APPROVAL', NULL, '2026-01-31 22:26:48.000'),
('f7408250-a377-44dd-b825-d0ddde31ee7b', '1be055bc-6831-4583-a674-5208c69b4075', 'STATUS_CHANGE', 'Status changed to WAITING_APPROVAL', NULL, '2026-01-31 22:16:19.000');

-- Table structure for table `ticket_items`
DROP TABLE IF EXISTS `ticket_items`;
CREATE TABLE `ticket_items` (
  `id` char(36) NOT NULL,
  `ticket_id` char(36) DEFAULT NULL,
  `product_id` char(36) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `ticket_items_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  CONSTRAINT `ticket_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `ticket_items`
INSERT INTO `ticket_items` VALUES 
('721c6651-031a-4480-b51d-89f9812bcec8', '1be055bc-6831-4583-a674-5208c69b4075', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 1, '2026-01-31 21:30:43.000'),
('c8363121-d3d6-4a27-8935-f427c42a2557', '1be055bc-6831-4583-a674-5208c69b4075', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 2, '2026-01-31 21:31:06.000'),
('e0bcaf24-5433-456c-9b5d-82a75877a4cc', '1be055bc-6831-4583-a674-5208c69b4075', '88e1f8f7-a7fa-4685-b59f-96f0df4f76d3', 1, '2026-02-02 20:07:12.000'),
('fa3e3947-dc86-4bf4-a38a-f6fede4451e9', '1be055bc-6831-4583-a674-5208c69b4075', '0f79ef0b-e7cf-4d2d-ae06-a6da2ca9cd9e', 1, '2026-01-31 21:30:52.000');

-- Table structure for table `ticket_sequences`
DROP TABLE IF EXISTS `ticket_sequences`;
CREATE TABLE `ticket_sequences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `ticket_sequences`

-- Table structure for table `tickets`
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `id` char(36) NOT NULL,
  `ticket_number` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `device_serial` varchar(100) DEFAULT NULL,
  `device_model` varchar(100) DEFAULT NULL,
  `issue_description` text DEFAULT NULL,
  `accessories_received` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`accessories_received`)),
  `inspection_notes` text DEFAULT NULL,
  `diagnosis_notes` text DEFAULT NULL,
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `approval_status` varchar(20) DEFAULT 'PENDING',
  `repair_notes` text DEFAULT NULL,
  `qa_checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qa_checklist`)),
  `final_cleaning_done` tinyint(1) DEFAULT 0,
  `status` varchar(20) NOT NULL,
  `technician_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `tickets`
INSERT INTO `tickets` VALUES 
('1be055bc-6831-4583-a674-5208c69b4075', 'JOB-2026-810', 'Janith', '55555', '33223nn3', 'Iphone', 'Camera Blur', '[]', 'capasitor blasted', 'few screatched 4', '3000.00', 'APPROVED', 'few screatched 3', NULL, 1, 'DELIVERED', NULL, '2026-01-31 21:30:19.000', '2026-02-02 20:08:47.000');

-- Table structure for table `trip_allowances`
DROP TABLE IF EXISTS `trip_allowances`;
CREATE TABLE `trip_allowances` (
  `id` char(36) NOT NULL,
  `employee_id` char(36) NOT NULL,
  `trip_date` date NOT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `hours_on_site` decimal(5,2) DEFAULT NULL,
  `batta_amount` decimal(10,2) DEFAULT NULL,
  `transport_amount` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `ticket_id` char(36) DEFAULT NULL,
  `status` enum('pending','approved','paid') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_employee_date` (`employee_id`,`trip_date`),
  CONSTRAINT `trip_allowances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No data for table `trip_allowances`

-- Table structure for table `user_sessions`
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token_hash`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `user_sessions`
INSERT INTO `user_sessions` VALUES 
('0d159da8-fd27-45c5-b59e-0adc546a1cf8', '5e052d76-daaa-4a79-b912-a52c116d0e9e', '$2b$10$Sb7U2mmSnBkiJZsECSM.LuCHSmSBswjmCXhbBv8Qb62m.XkJOespm', '2026-02-16 06:25:51.000', '2026-02-09 06:25:51.000'),
('962b0986-f009-49a6-b2b7-24379c0d1a72', '5e052d76-daaa-4a79-b912-a52c116d0e9e', '$2b$10$WG/bqO8WPB5YILmy2lZ.n.FR.oVJzK5dl5Jay4ZRYRZc5ZEwIiHxa', '2026-02-16 06:55:41.000', '2026-02-09 06:55:41.000'),
('b2642da6-b77e-4425-802a-e29c71a150b3', '30fc04d1-6d02-49dd-93cc-950a938a6006', '$2b$10$JPACmJNNP/Xy.XAE/Qkrr.VrHx9RfjErUTyE9E7RqtpdSa3r6FWki', '2026-02-18 12:34:56.000', '2026-02-11 12:34:56.000'),
('d00f653f-ff2b-4b6d-b7a3-1f53e50c05f9', '5e052d76-daaa-4a79-b912-a52c116d0e9e', '$2b$10$qfRj0A4.k5tjwHwMxuKF8eGr0K7KdXQohYmGOCQm1Jf2TBRSkVuyq', '2026-02-16 06:54:07.000', '2026-02-09 06:54:07.000'),
('fca188ae-8e5f-47e8-8498-76390bc633f6', '5e052d76-daaa-4a79-b912-a52c116d0e9e', '$2b$10$57Drm1GMjMXc4wgHTWGuSuXEuKUdLyzcWumgV/O8wowt68Il/qbVG', '2026-02-16 06:26:13.000', '2026-02-09 06:26:13.000');

-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('super_user','admin','manager','cashier','technician','hr_staff','accountant','ecommerce_admin','repair_admin') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `employee_id` char(36) DEFAULT NULL,
  `role_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `fk_user_employee` (`employee_id`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `users`
INSERT INTO `users` VALUES 
('30fc04d1-6d02-49dd-93cc-950a938a6006', 'superadmin', '$2b$12$1I13bXeDqxLyon/.9DQjSuQsST2u/tWaX9VXOBJmj89hjWt2XdHoy', 'System Administrator', 'admin@alexco.lk', 'super_user', 1, '2026-01-29 14:49:14.000', NULL, '2026-02-11 12:34:56.000', NULL, 'f6bb2b6f-7c9c-42ae-a7f0-46d5e93c7603'),
('5e052d76-daaa-4a79-b912-a52c116d0e9e', 'EMP-0008', '$2b$12$bTItlpA79hqdPNtKsARB1u1vW20frgvhEbFNEKRv.Av8FNK6cehl2', 'Janith Weerasingha', 'bsprk1@gmail.com', '', 1, '2026-02-09 05:43:28.000', '30fc04d1-6d02-49dd-93cc-950a938a6006', '2026-02-09 06:55:41.000', '550581cf-02d7-426f-ae1a-ab2e86500555', '56abcc96-6c84-4c14-b1ec-a4a6beab8970'),
('test-user-id-1', 'testuser1', 'hash', 'Test User', 'test@test.com', 'admin', 1, '2026-01-29 15:51:22.000', NULL, NULL, NULL, 'ef5f88a0-36eb-49cc-8545-e40f320856e0'),
('test-user-id-2', 'testuser2', 'hash', 'Test User 2', 'test2@test.com', 'admin', 1, '2026-01-29 15:51:22.000', NULL, NULL, NULL, 'ef5f88a0-36eb-49cc-8545-e40f320856e0'),
('user-kamal', 'kamal.tech', '$2b$10$aLeGnRykRIUuMAvoIhaT3O.MujxU0O3DzAIKlGaeLodIgw7xWsBjG', 'Kamal Perera', 'kamal.tech@alexco.lk', 'technician', 1, '2026-01-29 15:55:16.000', NULL, '2026-01-30 21:12:13.000', 'emp-kamal-tech', '3c34b622-2285-4722-8604-ea2f2606bf0c'),
('user-nimali', 'nimali.pos', '$2b$10$aLeGnRykRIUuMAvoIhaT3O.MujxU0O3DzAIKlGaeLodIgw7xWsBjG', 'Nimali Fernando', 'nimali.pos@alexco.lk', 'cashier', 1, '2026-01-29 15:55:16.000', NULL, NULL, 'emp-nimali-pos', '8ef9064b-f8cd-42cf-bbb8-06961bd89568'),
('user-sarah', 'sarah.hr', '$2b$10$DdNO3kik22nGAju.1oSth.Bzv0qav.5J/LJPB3n0AQhJpzYmC/lT2', 'Sarah Silva', 'sarah.hr@alexco.lk', 'hr_staff', 1, '2026-01-29 15:33:07.000', NULL, NULL, 'emp-sarah-hr', '0b7fc842-f956-4321-b4cc-486a04f28780');

SET FOREIGN_KEY_CHECKS=1;
