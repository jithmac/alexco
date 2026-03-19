const { query } = require('../lib/db');

async function migrate() {
    try {
        console.log("Adding EPF/ETF rate columns to employees table...");

        // Add columns if they don't exist
        await query(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS epf_employee_rate DECIMAL(5, 4) DEFAULT 0.0800,
            ADD COLUMN IF NOT EXISTS epf_employer_rate DECIMAL(5, 4) DEFAULT 0.1200,
            ADD COLUMN IF NOT EXISTS etf_employer_rate DECIMAL(5, 4) DEFAULT 0.0300
        `);

        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
