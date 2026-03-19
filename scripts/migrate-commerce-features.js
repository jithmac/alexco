const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not defined");
        process.exit(1);
    }

    const connection = await mysql.createConnection(connectionString);
    console.log("Connected to database.");

    try {
        // 1. Add weight_g to products
        console.log("Checking products table...");
        const [columns] = await connection.query("SHOW COLUMNS FROM products LIKE 'weight_g'");
        if (columns.length === 0) {
            console.log("Adding weight_g column to products...");
            await connection.query("ALTER TABLE products ADD COLUMN weight_g INT DEFAULT 0 AFTER price_cost");
        } else {
            console.log("weight_g column already exists.");
        }

        // 2. Create delivery_rates table
        console.log("Creating or checking delivery_rates table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS delivery_rates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                min_weight_g INT NOT NULL,
                max_weight_g INT NOT NULL,
                rate DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Create static_pages table
        console.log("Creating or checking static_pages table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS static_pages (
                slug VARCHAR(100) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Seed some initial data if empty
        const [rates] = await connection.query("SELECT COUNT(*) as count FROM delivery_rates");
        if (rates[0].count === 0) {
            console.log("Seeding default delivery rates...");
            await connection.query(`
                INSERT INTO delivery_rates (min_weight_g, max_weight_g, rate) VALUES 
                (0, 1000, 350.00),
                (1001, 5000, 750.00),
                (5001, 10000, 1500.00),
                (10001, 999999, 2500.00)
            `);
        }

        const [pages] = await connection.query("SELECT COUNT(*) as count FROM static_pages");
        if (pages[0].count === 0) {
            console.log("Seeding default policy pages...");
            const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
            await connection.query(`
                INSERT INTO static_pages (slug, title, content) VALUES
                ('privacy-policy', 'Privacy Policy', ?),
                ('terms-conditions', 'Terms & Conditions', ?),
                ('refund-policy', 'Refund Policy', ?)
             `, [lorem, lorem, lorem]);
        }

        console.log("Migration completed successfully.");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await connection.end();
    }
}

main();
