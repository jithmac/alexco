
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Migrating Pricing Tiers...");
    const pool = mysql.createPool(process.env.DATABASE_URL);

    // Add columns for Cost Price and Special Sale Price
    const COLUMNS = [
        "ADD COLUMN price_cost DECIMAL(10, 2) DEFAULT 0 AFTER price_retail",
        "ADD COLUMN price_sale DECIMAL(10, 2) DEFAULT 0 AFTER price_cost"
    ];

    try {
        for (const col of COLUMNS) {
            try {
                await pool.query(`ALTER TABLE products ${col}`);
                console.log(`Executed: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (Exists): ${col}`);
                } else {
                    console.error(`Error ${col}:`, e.message);
                }
            }
        }
    } catch (e) {
        console.error("Migration Error:", e);
    }

    await pool.end();
}

main();
