require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testQuery() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [rows] = await connection.query(`
            SELECT id, name, inventory_strategy 
            FROM products 
            LIMIT 5
        `);
        console.log("Strategies:", JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("Query Error:", err);
    } finally {
        await connection.end();
    }
}

testQuery();
