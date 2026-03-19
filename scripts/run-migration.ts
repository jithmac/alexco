import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function runMigration() {
    console.log('Running migration...');
    const { query } = await import('@/lib/db');

    const sqlPath = path.join(process.cwd(), 'database', 'add_is_active_to_products.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolon and run
    const statements = sql.split(';').filter(s => s.trim());

    for (const stmt of statements) {
        try {
            await query(stmt);
            console.log('Executed:', stmt.substring(0, 50) + '...');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists, skipping.');
            } else if (e.code === 'ER_DUP_KEYNAME') {
                console.log('Index already exists, skipping.');
            } else {
                console.error('Error:', e.message);
            }
        }
    }
    console.log('Done.');
}

runMigration().catch(console.error);
