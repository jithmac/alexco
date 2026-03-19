
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("Checking DB...");
    const pool = mysql.createPool(process.env.DATABASE_URL);

    try {
        const [rows] = await pool.query("SELECT id, name, image FROM products LIMIT 10");
        let output = "Products:\n";
        rows.forEach(p => {
            output += `- ${p.name}: ${p.image ? p.image : 'NO IMAGE'}\n`;
        });
        fs.writeFileSync('debug_images_output.txt', output);
        console.log("Output written to debug_images_output.txt");
    } catch (e) {
        console.error(e);
    }
    await pool.end();
}

main();
