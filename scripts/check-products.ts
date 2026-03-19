
import { query } from "../lib/db";

async function main() {
    try {
        const rows = await query("SELECT COUNT(*) as count FROM products") as any[];
        console.log("Product Count:", rows[0].count);

        const skus = await query("SELECT sku FROM products") as any[];
        console.log("SKUs:", skus.map(p => p.sku).join(", "));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
