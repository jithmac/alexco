import { query } from "../lib/db";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Starting migration: Add description to products...");

    try {
        // 1. Add column if not exists
        await query(`
      ALTER TABLE products
      ADD COLUMN description TEXT AFTER category_path;
    `);
        console.log("Column 'description' added.");
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'description' already exists.");
        } else {
            console.error("Error adding column:", e);
            // specific MySQL error for "Duplicate column name" is 1060 or ER_DUP_FIELDNAME
            // But we can continue if it exists.
        }
    }

    try {
        // 2. Backfill default descriptions
        await query(`
        UPDATE products 
        SET description = CONCAT('High quality ', name, ' suitable for residential and commercial use. 5-year warranty included.')
        WHERE description IS NULL OR description = '';
    `);
        console.log("Backfilled default descriptions.");

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }

    console.log("Migration complete.");
    process.exit(0);
}

main();
