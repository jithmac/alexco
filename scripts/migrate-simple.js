
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Starting migration (JS)...");

    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }

    const pool = mysql.createPool(process.env.DATABASE_URL);

    try {
        await pool.execute(`
            ALTER TABLE products
            ADD COLUMN description TEXT AFTER category_path;
        `);
        console.log("Column 'description' added.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'description' already exists.");
        } else {
            console.error("Error adding column:", e);
        }
    }

    try {
        await pool.execute(`
            UPDATE products 
            SET description = CONCAT('High quality ', name, ' suitable for residential and commercial use. 5-year warranty included.')
            WHERE description IS NULL OR description = '';
        `);
        console.log("Backfilled data.");
    } catch (e) {
        console.error("Backfill failed:", e);
    }

    await pool.end();
}

main();
