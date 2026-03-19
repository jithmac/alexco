
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Migrating Product Details...");
    const pool = mysql.createPool(process.env.DATABASE_URL);

    const COLUMNS = [
        "ADD COLUMN long_description TEXT",
        "ADD COLUMN warranty_period VARCHAR(100)",
        "ADD COLUMN warranty_policy TEXT",
        "ADD COLUMN features JSON",
        "ADD COLUMN whats_included JSON",
        "ADD COLUMN variations JSON"
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
