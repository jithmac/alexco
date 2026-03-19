// Migration Script: Run database changes
// Usage: node scripts/migrate-delivery-contact.js

require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function runMigration() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log('🔄 Running migrations...\n');

    try {
        // 1. Check and add delivery_method column
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME FROM information_schema.columns 
            WHERE table_schema = 'alexco_db' 
            AND table_name = 'sales_orders' 
            AND column_name = 'delivery_method'
        `);

        if (columns.length === 0) {
            await connection.query(`ALTER TABLE sales_orders ADD COLUMN delivery_method VARCHAR(20) DEFAULT 'delivery'`);
            console.log('✅ Added delivery_method column to sales_orders');
        } else {
            console.log('ℹ️  delivery_method column already exists');
        }

        // 2. Create contact_messages table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id CHAR(36) PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100),
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            )
        `);
        console.log('✅ contact_messages table verified');

        console.log('\n✨ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

runMigration();
