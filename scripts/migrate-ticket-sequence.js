const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log('Migrating database for Ticket Sequences...');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    try {
        const pool = mysql.createPool(connectionString);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS ticket_sequences (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created ticket_sequences table.');

        const [rows] = await pool.execute('SELECT count(*) as count FROM ticket_sequences');
        if (rows[0].count === 0) {
            await pool.execute('ALTER TABLE ticket_sequences AUTO_INCREMENT = 1001');
            console.log('Set initial sequence start to 1001');
        }
        await pool.end();

    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
