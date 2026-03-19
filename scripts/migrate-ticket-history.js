const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('Running migration: create ticket_history table');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_history (
                id CHAR(36) PRIMARY KEY,
                ticket_id CHAR(36) NOT NULL,
                action_type VARCHAR(50) NOT NULL,
                description TEXT,
                user_id CHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id),
                INDEX idx_ticket (ticket_id),
                INDEX idx_created_at (created_at)
            );
        `);

        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
