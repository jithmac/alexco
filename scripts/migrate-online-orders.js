require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not defined');
        process.exit(1);
    }

    const connection = await mysql.createConnection(connectionString);

    try {
        console.log('Connected to database. Checking schema...');

        // Helper to add column if not exists
        const addColumn = async (table, column, definition) => {
            try {
                await connection.query(`SELECT ${column} FROM ${table} LIMIT 1`);
                console.log(`Column ${column} already exists in ${table}.`);
            } catch (err) {
                if (err.code === 'ER_BAD_FIELD_ERROR') {
                    console.log(`Adding column ${column} to ${table}...`);
                    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
                    console.log(`Added ${column}.`);
                } else {
                    throw err;
                }
            }
        };

        await addColumn('sales_orders', 'customer_name', 'VARCHAR(255) NULL');
        await addColumn('sales_orders', 'customer_phone', 'VARCHAR(50) NULL');
        await addColumn('sales_orders', 'customer_email', 'VARCHAR(255) NULL');
        await addColumn('sales_orders', 'shipping_address', 'TEXT NULL');
        await addColumn('sales_orders', 'order_source', "VARCHAR(20) DEFAULT 'POS'");
        await addColumn('sales_orders', 'delivery_status', "VARCHAR(20) DEFAULT 'PENDING'");
        await addColumn('sales_orders', 'payment_proof', 'VARCHAR(512) NULL'); // URL or path

        console.log('Migration completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
