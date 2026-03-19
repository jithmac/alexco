
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Fallback to hardcoded if env var not found (matching other scripts)
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db";

async function migrate() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(DATABASE_URL);
    try {
        console.log('Checking for variant_id column in inventory_ledger...');
        const [rows] = await connection.execute(`
            SELECT count(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'inventory_ledger' 
            AND column_name = 'variant_id'
            AND table_schema = DATABASE()
        `);

        if (rows[0].count === 0) {
            console.log('Adding variant_id column...');
            await connection.execute(`
                ALTER TABLE inventory_ledger
                ADD COLUMN variant_id VARCHAR(255) NULL AFTER product_id
            `);
            console.log('Column variant_id added successfully.');
        } else {
            console.log('Column variant_id already exists.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
