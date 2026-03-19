
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log("--- LOCATIONS ---");
        const [locations] = await connection.execute('SELECT * FROM locations');
        console.log(locations);

        console.log("\n--- RECENT LEDGER ---");
        const [ledger] = await connection.execute('SELECT * FROM inventory_ledger ORDER BY created_at DESC LIMIT 5');
        console.log(ledger);

        console.log("\n--- LEDGER COLUMNS ---");
        const [cols] = await connection.execute('SHOW COLUMNS FROM inventory_ledger');
        cols.forEach(c => console.log(c.Field));

        await connection.end();
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
