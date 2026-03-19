-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id CHAR(36),
    image TEXT,
    icon VARCHAR(50), -- Lucide icon name or similar
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

-- Seed Initial Categories (Top Level)
INSERT IGNORE INTO categories (id, name, slug, description, order_index, icon) VALUES
('cat-solar', 'Solar & Power', 'solar', 'Solar panels, inverters, and battery systems', 1, 'Smartphone'),
('cat-electrical', 'Electrical', 'electrical', 'Wiring, switches, and protection devices', 2, 'Laptop'),
('cat-mobile', 'Mobile & Gadgets', 'mobile', 'Smartphones, tablets, and accessories', 3, 'Smartphone'),
('cat-computers', 'Computers', 'computers', 'Laptops, desktops, and components', 4, 'Laptop');

-- Seed Subcategories (Solar)
INSERT IGNORE INTO categories (id, name, slug, parent_id, order_index) VALUES
('sub-solar-panels', 'Solar Panels', 'solar-panels', 'cat-solar', 1),
('sub-inverters', 'Inverters', 'inverters', 'cat-solar', 2),
('sub-batteries', 'Batteries', 'batteries', 'cat-solar', 3),
('sub-solar-access', 'Accessories', 'solar-accessories', 'cat-solar', 4);

-- Seed Subcategories (Electrical)
INSERT IGNORE INTO categories (id, name, slug, parent_id, order_index) VALUES
('sub-wiring', 'Wiring & Cables', 'wiring-cables', 'cat-electrical', 1),
('sub-switches', 'Switches & Sockets', 'switches-sockets', 'cat-electrical', 2),
('sub-protection', 'Protection Devices', 'protection-devices', 'cat-electrical', 3),
('sub-lighting', 'Lighting', 'lighting', 'cat-electrical', 4);
