import { query } from "../lib/db";

async function migrate() {
    console.log("Starting Product Specs Migration...");
    try {
        await query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS whats_included JSON,
            ADD COLUMN IF NOT EXISTS features JSON;
        `);
        console.log("Migration successful: Added whats_included and features columns.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

migrate();
