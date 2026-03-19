
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debugSchema() {
    const { query, pool } = await import('../lib/db');

    try {
        const empCols = await query('DESCRIBE employees');
        fs.writeFileSync('employees_schema.json', JSON.stringify(empCols, null, 2));
        console.log('✅ Wrote employees_schema.json');

        const userCols = await query('DESCRIBE users');
        fs.writeFileSync('users_schema.json', JSON.stringify(userCols, null, 2));
        console.log('✅ Wrote users_schema.json');

        const balCols = await query('DESCRIBE leave_balances');
        fs.writeFileSync('balances_schema.json', JSON.stringify(balCols, null, 2));
        console.log('✅ Wrote balances_schema.json');

    } catch (e: any) {
        console.error('Error:', e.message);
    }

    await pool.end();
}

debugSchema();
