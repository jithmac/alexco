
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        const [rows] = await pool.query("SELECT COUNT(*) as c FROM products");
        console.log("COUNT: " + rows[0].c);
    } catch (e) {
        console.log("ERROR: " + e.message);
    }
    await pool.end();
}
main();
