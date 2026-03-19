
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixDatabase() {
    console.log("Connecting to database...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log("Connected. Applying fixes...");

    try {
        // 1. Fix sales_items
        console.log("Adding variant_options to sales_items...");
        await connection.query(`ALTER TABLE sales_items ADD COLUMN variant_options JSON`);
        console.log("✅ sales_items fixed.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ variant_options already exists.");
        } else {
            console.error("❌ Failed to alter sales_items:", e.message);
        }
    }

    try {
        // 2. Fix sales_orders (Customer info)
        console.log("Adding customer columns to sales_orders...");
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN customer_name VARCHAR(100)`);
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN customer_phone VARCHAR(20)`);
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN customer_email VARCHAR(100)`);
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN shipping_address TEXT`);
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN order_source VARCHAR(20) DEFAULT 'POS'`);
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN delivery_status VARCHAR(20) DEFAULT 'PENDING'`);
        await connection.query(`ALTER TABLE sales_orders ADD COLUMN payment_proof VARCHAR(255)`);
        console.log("✅ sales_orders fixed.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ Some sales_orders columns already exist (ignoring duplicates).");
        } else {
            console.log("⚠️ Note on sales_orders:", e.message);
        }
    }

    try {
        // 3. Fix delivery_rates
        console.log("Creating delivery_rates table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS delivery_rates (
                id CHAR(36) PRIMARY KEY,
                min_weight_g INT NOT NULL,
                max_weight_g INT NOT NULL,
                rate DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ delivery_rates fixed.");
    } catch (e) {
        console.error("❌ Failed to create delivery_rates:", e.message);
    }

    try {
        // 4. Fix categories
        console.log("Creating categories table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id CHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                parent_id CHAR(36),
                image TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                order_index INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_parent (parent_id),
                INDEX idx_slug (slug)
            )
        `);
        console.log("✅ categories fixed.");
    } catch (e) {
        console.error("❌ Failed to create categories:", e.message);
    }

    console.log("\nDone! Please restart your application.");
    connection.end();
}

fixDatabase();
