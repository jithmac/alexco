
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debugTypes() {
    const { query, pool } = await import('../lib/db');
    try {
        const cols = await query('DESCRIBE leave_types') as any[];
        console.log(JSON.stringify(cols.map((c: any) => c.Field), null, 2));
    } catch (e: any) {
        console.error(e.message);
    }
    await pool.end();
}
debugTypes();
