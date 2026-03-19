require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to database.');

    try {
        console.log('Adding payment_status column to sales_orders table...');
        try {
            await connection.query('ALTER TABLE sales_orders ADD COLUMN payment_status VARCHAR(20) DEFAULT "PENDING"');
            console.log('Added payment_status column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('payment_status already exists.');
            else throw e;
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
