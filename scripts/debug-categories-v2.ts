
import { query } from "../lib/db";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function debugCategories() {
    try {
        let output = "";
        output += "--- Categories ---\n";
        const categories = await query('SELECT id, name, slug, parent_id FROM categories');
        output += JSON.stringify(categories, null, 2) + "\n";

        output += "\n--- Products (Sample) ---\n";
        const products = await query('SELECT id, name, category_path FROM products LIMIT 10');
        output += JSON.stringify(products, null, 2) + "\n";

        output += "\n--- Distinct Product Categories ---\n";
        const distCats = await query('SELECT DISTINCT category_path FROM products');
        output += JSON.stringify(distCats, null, 2) + "\n";

        fs.writeFileSync('debug_output.txt', output);
        console.log("Debug output written to debug_output.txt");

    } catch (e) {
        console.error("Error:", e);
    }
}

debugCategories();
