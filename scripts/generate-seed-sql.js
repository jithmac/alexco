const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function generate() {
    console.log('Generating seed-data.sql...');

    let sql = `-- Seed Data generated for Hostinger\n\n`;

    // 1. Locations
    const mainStoreId = uuidv4();
    sql += `-- Locations\n`;
    sql += `INSERT IGNORE INTO locations (id, name, type) VALUES ('${mainStoreId}', 'Main Store', 'Store');\n`;

    // 2. Products
    const PRODUCTS = [
        { sku: 'SOL-PNL-450W', name: 'Jinko Solar Tiger Neo 450W', cat: 'Solar', price: 45000, desc: 'High efficiency N-type mono module.' },
        { sku: 'SOL-PNL-550W', name: 'Jinko Solar Tiger Pro 550W', cat: 'Solar', price: 52000, desc: 'Ultra-high power for large installations.' },
        { sku: 'INV-HUA-5K', name: 'Huawei SUN2000-5KTL-L1', cat: 'Electrical', price: 285000, desc: 'Smart Energy Center, Single Phase.' },
        { sku: 'BAT-LFP-5K', name: 'Huawei LUNA2000-5-E0 (5kWh)', cat: 'Solar', price: 650000, desc: 'Smart String Energy Storage System.' },
        { sku: 'CABLE-PV-4MM', name: 'PV Cable 4mm (Red)', cat: 'Electrical', price: 350, desc: 'UV resistant solar cable, per meter.' },
        { sku: 'SMART-SW-1G', name: 'Tuya Smart Switch 1-Gang', cat: 'Electrical', price: 4500, desc: 'WiFi + Bluetooth, No Neutral required.' }
    ];

    sql += `\n-- Products\n`;
    for (const p of PRODUCTS) {
        const id = uuidv4();
        sql += `INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications) VALUES ('${id}', '${p.sku}', '${p.name}', '${p.cat}', ${p.price}, 'VAT_18', '${p.desc}', '{}') ON DUPLICATE KEY UPDATE name=VALUES(name);\n`;

        // Inventory
        sql += `INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code) VALUES ('${uuidv4()}', '${id}', '${mainStoreId}', 50, 'INITIAL_STOCK');\n`;
    }

    // 3. Update Admin User
    // Password: Ican123ZXC++
    const hash = await bcrypt.hash('Ican123ZXC++', 10);
    sql += `\n-- Update Admin Password\n`;
    sql += `UPDATE users SET password_hash = '${hash}', is_active = 1 WHERE username = 'admin';\n`;

    // 4. Create proper user if not exists (using the username user provided just in case)
    // username: u624100610_alexco2
    sql += `\n-- Ensure DB Access User exists as app user too\n`;
    const dbUserHash = await bcrypt.hash('Ican123ZXC++', 10);
    const dbUserId = uuidv4();
    sql += `INSERT IGNORE INTO users (id, username, password_hash, full_name, role, is_active) VALUES ('${dbUserId}', 'u624100610_alexco2', '${dbUserHash}', 'Database Admin', 'super_user', 1);\n`;

    fs.writeFileSync('seed-data.sql', sql);
    console.log('Done. Wrote to seed-data.sql');
}

generate();
