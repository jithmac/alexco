
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testInsert() {
    const { query, pool } = await import('../lib/db');

    console.log('🧪 Testing full insert...');

    try {
        await query(`
            INSERT INTO employees (
                id, 
                employee_number, 
                full_name, 
                department, 
                designation, 
                role, 
                status, 
                joined_date, 
                email, 
                phone_mobile, 
                address_line1
            )
            VALUES (?, ?, ?, ?, ?, ?, 'active', '2023-01-15', ?, '0771234567', '123 Mock Street')
        `, ['test-id-full', 'EMP-FULL', 'Test Full', 'hr', 'Manager', 'manager', 'test@test.com']);
        console.log('✅ Full insert passed');
    } catch (e: any) {
        const msg = `Message: ${e.message}\nSQLMessage: ${e.sqlMessage}\nCode: ${e.code}`;
        fs.writeFileSync('logs/seed_error_full.txt', msg);
        console.log('❌ Full insert failed. Check logs/seed_error_full.txt');
    }

    await pool.end();
}

if (!fs.existsSync('logs')) fs.mkdirSync('logs');
testInsert();
