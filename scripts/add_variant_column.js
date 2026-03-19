
const mysql = require('mysql2/promise');

// Hardcoded for migration - derived from .env.local
const DATABASE_URL = "mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db";

async function migrate() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(DATABASE_URL);
    try {
        console.log('Adding variant_options column to sales_items...');
        const [rows] = await connection.execute(`
            SELECT count(*) as count 
            FROM information_schema.columns 
            WHERE table_name = 'sales_items' 
            AND column_name = 'variant_options'
            AND table_schema = DATABASE()
        `);

        if (rows[0].count === 0) {
            await connection.execute(`
                ALTER TABLE sales_items
                ADD COLUMN variant_options JSON NULL
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column already exists.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
