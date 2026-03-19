
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debugDb() {
    const { query, pool } = await import('../lib/db');

    console.log('🔍 Inspecting employees table...');
    try {
        const columns = await query('DESCRIBE employees') as any[];
        console.log(JSON.stringify(columns.map(c => c.Field), null, 2));
    } catch (e: any) {
        console.error(e.message);
    }

    await pool.end();
}

debugDb();
