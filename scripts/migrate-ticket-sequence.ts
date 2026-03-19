import { query } from '../lib/db';

async function migrate() {
    console.log('Migrating database for Ticket Sequences...');

    try {
        await query(`
            CREATE TABLE IF NOT EXISTS ticket_sequences (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created ticket_sequences table.');

        // Seed initial value if empty (start at 1000)
        // We can't easily set AUTO_INCREMENT start in all mysql versions dynamically without ALTER TABLE, 
        // but we can insert a dummy row at 1000
        const rows = await query('SELECT count(*) as count FROM ticket_sequences') as any[];
        if (rows[0].count === 0) {
            await query('ALTER TABLE ticket_sequences AUTO_INCREMENT = 1001');
            console.log('Set initial sequence start to 1001');
        }

    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
