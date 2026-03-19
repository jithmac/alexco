
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debugUsers() {
    const { query, pool } = await import('../lib/db');

    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync('logs/user_debug.txt', msg + '\n');
    };

    if (!fs.existsSync('logs')) fs.mkdirSync('logs');
    fs.writeFileSync('logs/user_debug.txt', '--- USER DEBUG ---\n');

    try {
        log('1. Describing users table:');
        const cols = await query('DESCRIBE users') as any[];
        log(JSON.stringify(cols.map(c => c.Field), null, 2));

        log('\n2. Attempting Insert WITH employee_id');
        await query(`
            INSERT INTO users (id, username, password_hash, full_name, email, role, employee_id)
            VALUES (?, ?, 'hash', 'Test User', 'test@test.com', 'admin', NULL)
        `, ['test-user-id-1', 'testuser1']);
        log('✅ Insert WITH employee_id passed');

    } catch (e: any) {
        log(`❌ Insert WITH employee_id failed: ${e.message}\nSQL: ${e.sqlMessage}`);
    }

    try {
        log('\n3. Attempting Insert WITHOUT employee_id');
        await query(`
            INSERT INTO users (id, username, password_hash, full_name, email, role)
            VALUES (?, ?, 'hash', 'Test User 2', 'test2@test.com', 'admin')
        `, ['test-user-id-2', 'testuser2']);
        log('✅ Insert WITHOUT employee_id passed');
    } catch (e: any) {
        log(`❌ Insert WITHOUT employee_id failed: ${e.message}`);
    }

    await pool.end();
}

debugUsers();
