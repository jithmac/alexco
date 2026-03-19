require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    console.log("Starting Product Specs Migration (JS)...");

    // Create connection
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'Ican123ZXC',
        database: 'alexco_db',
        port: 3306
    });

    try {
        await connection.execute(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS whats_included JSON,
            ADD COLUMN IF NOT EXISTS features JSON;
        `);
        console.log("Migration successful: Added whats_included and features columns.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await connection.end();
    }
}

migrate();
