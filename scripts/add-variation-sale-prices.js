require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function migrate() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        console.log("Checking columns in products table...");
        const [rows] = await conn.query("SHOW COLUMNS FROM products LIKE 'variation_sale_prices'");
        if (rows.length === 0) {
            console.log("Adding variation_sale_prices column...");
            await conn.query("ALTER TABLE products ADD COLUMN variation_sale_prices JSON DEFAULT NULL AFTER variation_prices");
            console.log("Migration complete.");
        } else {
            console.log("Column already exists.");
        }

        // Also check if children exist for categories to diagnose Task 2
        console.log("\nChecking store categories for Task 2...");
        const [cats] = await conn.query("SELECT id, name, parent_id FROM categories WHERE is_active = TRUE");
        console.log("Active categories:", cats.length);
        const roots = cats.filter(c => !c.parent_id);
        const children = cats.filter(c => c.parent_id);
        console.log(`Roots: ${roots.length}, Children: ${children.length}`);
        if (children.length > 0) {
            console.log("Example child mapping: ", children[0].name, " -> parent:", children[0].parent_id);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await conn.end();
    }
}
migrate();
