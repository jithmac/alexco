require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    console.log("Starting Gallery Column Migration...");

    // Create connection
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log("Connected to database.");

        // Add gallery column
        await connection.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS gallery JSON
        `);

        console.log("Migration successful: Added 'gallery' column.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await connection.end();
    }
}

migrate();
