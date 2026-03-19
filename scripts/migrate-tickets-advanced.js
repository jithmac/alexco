
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Migrating Tickets Table for Advanced Workflow...");
    const pool = mysql.createPool(process.env.DATABASE_URL);

    try {
        // Add new columns
        // 1. Reception & Inspection
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS accessories_received JSON DEFAULT NULL AFTER issue_description`);
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS inspection_notes TEXT DEFAULT NULL AFTER accessories_received`);

        // 2. Diagnosis & Estimate
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS diagnosis_notes TEXT DEFAULT NULL AFTER inspection_notes`);
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 2) DEFAULT NULL AFTER diagnosis_notes`);

        // 3. Approval
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'PENDING' AFTER estimated_cost`); // PENDING, APPROVED, REJECTED

        // 4. Repair Execution
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS repair_notes TEXT DEFAULT NULL AFTER approval_status`);

        // 5. QA & Finishing
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qa_checklist JSON DEFAULT NULL AFTER repair_notes`);
        await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS final_cleaning_done BOOLEAN DEFAULT FALSE AFTER qa_checklist`);

        console.log("✅ Tickets table updated successfully.");
    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        await pool.end();
    }
}

main();
