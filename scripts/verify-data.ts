
import { query } from "../lib/db";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyData() {
    try {
        console.error("DEBUG: Starting verification...");

        const categories = await query('SELECT slug FROM categories LIMIT 3') as any[];
        console.error("DEBUG: Category Slugs:");
        categories.forEach(c => console.error(`- ${c.slug}`));

        const products = await query('SELECT category_path FROM products LIMIT 3') as any[];
        console.error("DEBUG: Product Categories:");
        products.forEach(p => console.error(`- ${p.category_path}`));

    } catch (e) {
        console.error("Error:", e);
    }
}

verifyData();
