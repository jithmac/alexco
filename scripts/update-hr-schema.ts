
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables BEFORE importing db
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function updateSchema() {
    // Dynamic import to ensure env vars are loaded first
    const { query, pool } = await import('../lib/db');

    console.log('🔄 Updating database schema for HR module...');

    // Check connection first
    try {
        await query('SELECT 1');
        console.log('✅ Connected to database.');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }

    const columns = [
        "ADD COLUMN employee_number VARCHAR(20) UNIQUE",
        "ADD COLUMN full_name VARCHAR(100) NOT NULL",
        "ADD COLUMN name_with_initials VARCHAR(100)",
        "ADD COLUMN nic_number VARCHAR(15) UNIQUE",
        "ADD COLUMN date_of_birth DATE",
        "ADD COLUMN gender ENUM('male', 'female', 'other')",
        "ADD COLUMN marital_status ENUM('single', 'married', 'divorced', 'widowed')",
        "ADD COLUMN address_line1 VARCHAR(255)",
        "ADD COLUMN address_line2 VARCHAR(255)",
        "ADD COLUMN city VARCHAR(100)",
        "ADD COLUMN district VARCHAR(100)",
        "ADD COLUMN postal_code VARCHAR(10)",
        "ADD COLUMN phone_mobile VARCHAR(20)",
        "ADD COLUMN phone_home VARCHAR(20)",
        "ADD COLUMN email VARCHAR(100)",
        "ADD COLUMN emergency_contact_name VARCHAR(100)",
        "ADD COLUMN emergency_contact_phone VARCHAR(20)",
        "ADD COLUMN emergency_contact_relation VARCHAR(50)",
        "ADD COLUMN department ENUM('retail', 'solar', 'repair', 'admin', 'hr', 'accounts')",
        "ADD COLUMN designation VARCHAR(100)",
        "ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'STAFF'",
        "ADD COLUMN employment_type ENUM('permanent', 'contract', 'probation', 'intern')",
        "ADD COLUMN joined_date DATE",
        "ADD COLUMN confirmation_date DATE",
        "ADD COLUMN resignation_date DATE",
        "ADD COLUMN basic_salary DECIMAL(10, 2)",
        "ADD COLUMN fixed_allowances DECIMAL(10, 2)",
        "ADD COLUMN bank_name VARCHAR(100)",
        "ADD COLUMN bank_branch VARCHAR(100)",
        "ADD COLUMN bank_account_number VARCHAR(50)",
        "ADD COLUMN bank_account_name VARCHAR(100)",
        "ADD COLUMN epf_number VARCHAR(20)",
        "ADD COLUMN status ENUM('active', 'inactive', 'terminated', 'resigned') DEFAULT 'active'"
    ];

    console.log(`Checking 'employees' table updates...`);

    for (const col of columns) {
        try {
            await query(`ALTER TABLE employees ${col}`);
            console.log(`✅ ${col}`);
        } catch (error: any) {
            // Check for "Duplicate column name" error code (1060)
            if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes("Duplicate column name")) {
                console.log(`⏭️  Column exists: ${col.split(' ')[2]}`);
            } else {
                console.warn(`❌ Error running "${col}": ${error.message}`);
                // Continue despite errors to try other columns
            }
        }
    }

    await pool.end();
    console.log('\n✅ UPDATE COMPLETE.');
}

updateSchema().catch(err => {
    console.error('❌ Update failed:', err);
    process.exit(1);
});
