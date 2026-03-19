require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to database.');

    try {
        console.log('Creating couriers table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS couriers (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                tracking_url_template VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Couriers table created.');

        try {
            await connection.query('ALTER TABLE sales_orders ADD COLUMN courier_id VARCHAR(36) NULL');
            console.log('Added courier_id column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('courier_id already exists.');
            else throw e;
        }

        try {
            await connection.query('ALTER TABLE sales_orders ADD COLUMN tracking_number VARCHAR(255) NULL');
            console.log('Added tracking_number column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('tracking_number already exists.');
            else throw e;
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
