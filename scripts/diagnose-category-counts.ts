import * as dotenv from "dotenv";
import path from "path";

// Load .env.local BEFORE importing db
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { query } from "../lib/db";

async function main() {
    try {
        console.log("--- Categories ---");
        const categories = await query("SELECT id, name, slug, parent_id FROM categories") as any[];
        console.table(categories);

        console.log("\n--- Products (Sample) ---");
        const products = await query("SELECT id, name, category_path FROM products LIMIT 10") as any[];
        console.table(products);

        console.log("\n--- Test Queries ---");
        for (const cat of categories) {
            const result = await query(
                "SELECT COUNT(*) as count FROM products WHERE category_path LIKE CONCAT('%', ?, '%')",
                [cat.slug]
            ) as any[];
            console.log(`Category: ${cat.name} (${cat.slug}) -> Count: ${result[0].count}`);
        }

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
