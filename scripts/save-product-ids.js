require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const fs = require('fs');

async function listProducts() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [rows] = await connection.query('SELECT id, name FROM products LIMIT 5');
        fs.writeFileSync('product_ids.txt', JSON.stringify(rows, null, 2));
    } catch (e) { console.error(e); }
    finally {
        await connection.end();
    }
}

listProducts();
