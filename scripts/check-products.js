
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Checking DB...");
    const pool = mysql.createPool(process.env.DATABASE_URL);

    try {
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM products");
        console.log("Product Count:", rows[0].count);

        const [skus] = await pool.query("SELECT sku FROM products");
        console.log("SKUs:", skus.map(p => p.sku).join(", "));
    } catch (e) {
        console.error(e);
    }
    await pool.end();
}

main();
