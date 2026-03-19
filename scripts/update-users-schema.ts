
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables BEFORE importing db
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function updateSchema() {
    // Dynamic import to ensure env vars are loaded first
    const { query, pool } = await import('../lib/db');

    console.log('🔄 Updating users table schema...');

    try {
        // Add employee_id to users
        await query(`
            ALTER TABLE users 
            ADD COLUMN employee_id CHAR(36) NULL,
            ADD CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
        `);
        console.log('✅ Added employee_id to users table.');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⏭️  Column employee_id already exists in users.');
        } else {
            console.warn(`❌ Error updating users table: ${error.message}`);
        }
    }

    await pool.end();
    console.log('\n✅ USERS SCHEMA UPDATE COMPLETE.');
}

updateSchema().catch(err => {
    console.error('❌ Update failed:', err);
    process.exit(1);
});
