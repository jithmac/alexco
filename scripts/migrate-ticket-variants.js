require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to database.');

    try {
        console.log('Adding variant_id column to ticket_items...');
        await connection.query('ALTER TABLE ticket_items ADD COLUMN variant_id VARCHAR(255) NULL AFTER product_id');
        console.log('Migration successful: variant_id column added.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column variant_id already exists. Skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
    }
}

migrate();
