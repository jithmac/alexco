
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        // Describe the products table
        const [rows] = await connection.execute("DESCRIBE products");
        console.log("Schema for 'products' table:");
        console.table(rows);
        await connection.end();
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
