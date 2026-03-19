
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function updateSchema() {
    const { query, pool } = await import('../lib/db');

    console.log('🔄 Updating leave_requests schema...');

    const columns = [
        "ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'",
        "ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];

    for (const col of columns) {
        try {
            await query(`ALTER TABLE leave_requests ${col}`);
            console.log(`✅ ${col}`);
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes("Duplicate column")) {
                console.log(`⏭️  Column exists: ${col.split(' ')[2]}`);
            } else {
                console.warn(`❌ Error running "${col}": ${error.message}`);
            }
        }
    }

    await pool.end();
}

updateSchema().catch(console.error);
