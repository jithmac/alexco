
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function updateSchema() {
    const { query, pool } = await import('../lib/db');

    console.log('🔄 Updating employees schema for EPF/ETF...');

    const columns = [
        "ADD COLUMN epf_number VARCHAR(50) NULL",
        "ADD COLUMN etf_number VARCHAR(50) NULL"
    ];

    for (const col of columns) {
        try {
            await query(`ALTER TABLE employees ${col}`);
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
