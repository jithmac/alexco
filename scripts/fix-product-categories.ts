
import { query } from "../lib/db";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixProductCategories() {
    try {
        console.log("Starting product category fix...");

        // 1. Fix 'Solar' -> 'solar'
        console.log("Fixing 'Solar' -> 'solar'...");
        const resultSolar = await query(`
            UPDATE products 
            SET category_path = 'solar' 
            WHERE category_path = 'Solar'
        `);
        console.log("Updated Solar rows:", resultSolar);

        // 2. Fix 'Electrical' -> 'electrical'
        console.log("Fixing 'Electrical' -> 'electrical'...");
        const resultElec = await query(`
            UPDATE products 
            SET category_path = 'electrical' 
            WHERE category_path = 'Electrical'
        `);
        console.log("Updated Electrical rows:", resultElec);

        // 3. Verify
        console.log("\n--- Verification: Distinct Categories ---");
        const distCats = await query('SELECT DISTINCT category_path FROM products');
        console.table(distCats);

        console.log("Fix complete.");
    } catch (e) {
        console.error("Error fixing categories:", e);
    }
}

fixProductCategories();
