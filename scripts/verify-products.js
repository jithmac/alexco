
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Verifying Product Linkage...");
    const pool = mysql.createPool(process.env.DATABASE_URL);

    // 1. Total Products
    const [total] = await pool.query("SELECT COUNT(*) as count FROM products");
    console.log(`Total Products in DB: ${total[0].count}`);

    // 2. POS Visible (inventory_strategy != 'DISCONTINUED')
    const [pos] = await pool.query("SELECT COUNT(*) as count FROM products WHERE inventory_strategy != 'DISCONTINUED'");
    console.log(`Visible in POS: ${pos[0].count}`);

    // 3. Store Visible (Check logic from server-actions/store/products.ts)
    // Assuming store uses same or no filter based on previous finding, but we'll verify.
    // If store has no filter:
    const [store] = await pool.query("SELECT COUNT(*) as count FROM products");
    console.log(`Visible in Store (Base): ${store[0].count}`);

    // Check for any discrepancies
    const [discrepancies] = await pool.query(`
        SELECT name, sku, inventory_strategy 
        FROM products 
        WHERE inventory_strategy = 'DISCONTINUED'
    `);

    if (discrepancies.length > 0) {
        console.log("\nProducts excluded from POS (DISCONTINUED):");
        discrepancies.forEach(p => console.log(`- ${p.name} (${p.sku})`));
    } else {
        console.log("\nNo products are currently marked as DISCONTINUED.");
    }

    await pool.end();
}

main();
